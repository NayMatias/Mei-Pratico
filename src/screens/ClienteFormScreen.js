/**
 * Cadastro / edição de cliente — etapa 6 (13/10 a 26/10).
 * O endereço é preenchido pelo CEP (ViaCEP) e convertido em coordenadas
 * para aparecer no mapa e permitir o cálculo da rota.
 */
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import Botao from '../components/Botao';
import Campo from '../components/Campo';
import { buscarCliente, excluirCliente, salvarCliente } from '../database/db';
import { buscarCEP } from '../services/cep';
import { enderecoParaCoordenadas } from '../services/localizacao';
import { cores } from '../theme/cores';
import { mascaraCEP, mascaraTelefone } from '../utils/formatar';
import { validarTelefone } from '../utils/validar';

const VAZIO = { nome: '', telefone: '', cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '', complemento: '' };

export default function ClienteFormScreen({ route, navigation }) {
  const clienteId = route.params?.clienteId;
  const [cliente, setCliente] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: clienteId ? 'Editar cliente' : 'Novo cliente' });
    if (clienteId) {
      buscarCliente(clienteId).then((c) => c && setCliente({ ...VAZIO, ...c }));
    }
  }, [clienteId, navigation]);

  function alterar(campo, valor) {
    setCliente((atual) => ({ ...atual, [campo]: valor }));
  }

  async function aoDigitarCEP(texto) {
    const cep = mascaraCEP(texto);
    alterar('cep', cep);
    if (cep.replace(/\D/g, '').length === 8) {
      setBuscandoCEP(true);
      try {
        const endereco = await buscarCEP(cep);
        setCliente((atual) => ({ ...atual, ...endereco }));
        setErros((e) => ({ ...e, cep: undefined }));
      } catch (e) {
        setErros((atual) => ({ ...atual, cep: e.message }));
      } finally {
        setBuscandoCEP(false);
      }
    }
  }

  function validar() {
    const novos = {};
    if (cliente.nome.trim().length < 2) novos.nome = 'Informe o nome do cliente.';
    if (cliente.telefone && !validarTelefone(cliente.telefone)) novos.telefone = 'Telefone com DDD.';
    if (cliente.logradouro && !cliente.numero) novos.numero = 'Informe o número.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function salvar() {
    if (!validar()) return;
    setSalvando(true);
    try {
      let coordenadas = { latitude: cliente.latitude ?? null, longitude: cliente.longitude ?? null };

      // Converte o endereço em latitude/longitude para o mapa e as rotas
      if (cliente.logradouro && cliente.cidade) {
        const texto = `${cliente.logradouro}, ${cliente.numero}, ${cliente.bairro}, ${cliente.cidade} - ${cliente.uf}, Brasil`;
        const encontrado = await enderecoParaCoordenadas(texto);
        if (encontrado) coordenadas = encontrado;
      }

      await salvarCliente({ ...cliente, nome: cliente.nome.trim(), ...coordenadas, id: clienteId });

      if (cliente.logradouro && coordenadas.latitude == null) {
        Alert.alert('Cliente salvo', 'Não consegui localizar o endereço no mapa. Confira a rua e o número.');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o cliente.');
      console.warn(e);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert('Excluir cliente?', 'Os atendimentos desse cliente também serão apagados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await excluirCliente(clienteId);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Campo rotulo="Nome" obrigatorio value={cliente.nome} onChangeText={(t) => alterar('nome', t)} erro={erros.nome} placeholder="Ex.: Maria Souza" />
        <Campo
          rotulo="Telefone / WhatsApp"
          value={cliente.telefone ?? ''}
          onChangeText={(t) => alterar('telefone', mascaraTelefone(t))}
          erro={erros.telefone}
          keyboardType="phone-pad"
          placeholder="(47) 99999-0000"
        />

        <Text style={{ fontSize: 16, fontWeight: '700', color: cores.texto, marginVertical: 8 }}>Endereço do atendimento</Text>

        <Campo
          rotulo={buscandoCEP ? 'CEP (buscando...)' : 'CEP'}
          value={cliente.cep ?? ''}
          onChangeText={aoDigitarCEP}
          erro={erros.cep}
          keyboardType="number-pad"
          placeholder="88340-000"
        />
        <Campo rotulo="Rua" value={cliente.logradouro ?? ''} onChangeText={(t) => alterar('logradouro', t)} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Campo
            rotulo="Número"
            value={cliente.numero ?? ''}
            onChangeText={(t) => alterar('numero', t)}
            erro={erros.numero}
            keyboardType="number-pad"
            style={{ flex: 1 }}
          />
          <Campo rotulo="Complemento" value={cliente.complemento ?? ''} onChangeText={(t) => alterar('complemento', t)} style={{ flex: 2 }} />
        </View>
        <Campo rotulo="Bairro" value={cliente.bairro ?? ''} onChangeText={(t) => alterar('bairro', t)} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Campo rotulo="Cidade" value={cliente.cidade ?? ''} onChangeText={(t) => alterar('cidade', t)} style={{ flex: 3 }} />
          <Campo
            rotulo="UF"
            value={cliente.uf ?? ''}
            onChangeText={(t) => alterar('uf', t.toUpperCase().slice(0, 2))}
            autoCapitalize="characters"
            style={{ flex: 1 }}
          />
        </View>

        <Botao titulo="Salvar cliente" onPress={salvar} carregando={salvando} style={{ marginTop: 8 }} />
        {clienteId ? <Botao titulo="Excluir cliente" variante="perigo" onPress={confirmarExclusao} style={{ marginTop: 12 }} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
