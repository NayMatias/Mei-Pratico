/**
 * Lista de clientes — etapa 6 (13/10 a 26/10), cadastro rápido de clientes.
 */
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Botao from '../components/Botao';
import Campo from '../components/Campo';
import Cartao from '../components/Cartao';
import { listarClientes } from '../database/db';
import { cores } from '../theme/cores';
import { enderecoCompleto } from '../utils/formatar';

export default function ClientesScreen({ navigation }) {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');

  useFocusEffect(
    useCallback(() => {
      listarClientes(busca).then(setClientes);
    }, [busca])
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Campo value={busca} onChangeText={setBusca} placeholder="🔎  Buscar cliente" />

      <FlatList
        data={clientes}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={{ paddingBottom: 90 }}
        ListEmptyComponent={
          <Text style={estilos.vazio}>
            {busca ? 'Nenhum cliente encontrado.' : 'Você ainda não cadastrou clientes.\nToque em “Novo cliente” para começar.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Cartao
            titulo={item.nome}
            subtitulo={enderecoCompleto(item) || item.telefone || 'Sem endereço'}
            etiqueta={item.latitude == null ? 'sem mapa' : undefined}
            onPress={() => navigation.navigate('ClienteForm', { clienteId: item.id })}
          />
        )}
      />

      <Botao titulo="+ Novo cliente" onPress={() => navigation.navigate('ClienteForm')} style={estilos.flutuante} />
    </View>
  );
}

const estilos = StyleSheet.create({
  vazio: { textAlign: 'center', color: cores.textoSuave, marginTop: 40, fontSize: 15, lineHeight: 22 },
  flutuante: { position: 'absolute', left: 16, right: 16, bottom: 24 },
});
