/**
 * Fluxo de navegação entre as telas — etapa 2 do cronograma (18/08 a 31/08).
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BoasVindasScreen from '../screens/BoasVindasScreen';
import InicioScreen from '../screens/InicioScreen';
import ServicoScreen from '../screens/ServicoScreen';
import FinalizarScreen from '../screens/FinalizarScreen';
import MapaScreen from '../screens/MapaScreen';
import RotaScreen from '../screens/RotaScreen';
import ClientesScreen from '../screens/ClientesScreen';
import ClienteFormScreen from '../screens/ClienteFormScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import { cores } from '../theme/cores';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ rotaInicial = 'BoasVindas' }) {
  return (
    <Stack.Navigator
      initialRouteName={rotaInicial}
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.branco,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="BoasVindas" component={BoasVindasScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Inicio" component={InicioScreen} options={{ title: 'MEI Prático' }} />
      <Stack.Screen name="Servico" component={ServicoScreen} options={{ title: 'Novo atendimento' }} />
      <Stack.Screen name="Finalizar" component={FinalizarScreen} options={{ title: 'Finalizar atendimento' }} />
      <Stack.Screen name="Mapa" component={MapaScreen} options={{ title: 'Mapa do dia' }} />
      <Stack.Screen name="Rota" component={RotaScreen} options={{ title: 'Rota até o cliente' }} />
      <Stack.Screen name="Clientes" component={ClientesScreen} options={{ title: 'Clientes' }} />
      <Stack.Screen name="ClienteForm" component={ClienteFormScreen} options={{ title: 'Cliente' }} />
      <Stack.Screen name="Historico" component={HistoricoScreen} options={{ title: 'Histórico' }} />
    </Stack.Navigator>
  );
}
