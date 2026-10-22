import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { iniciarBanco, buscarPrestador } from './src/database/db';
import { cores } from './src/theme/cores';

export default function App() {
  const [carregando, setCarregando] = useState(true);
  const [temCadastro, setTemCadastro] = useState(false);

  useEffect(() => {
    // Ao abrir o app: cria as tabelas (se ainda não existirem)
    // e verifica se o prestador já fez o cadastro rápido.
    async function preparar() {
      try {
        await iniciarBanco();
        const prestador = await buscarPrestador();
        setTemCadastro(!!prestador);
      } catch (erro) {
        console.warn('Erro ao preparar o banco de dados:', erro);
      } finally {
        setCarregando(false);
      }
    }
    preparar();
  }, []);

  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo }}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator rotaInicial={temCadastro ? 'Inicio' : 'BoasVindas'} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
