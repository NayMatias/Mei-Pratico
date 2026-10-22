import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { cores } from '../theme/cores';

/**
 * Botão padrão do app.
 * variante: 'primario' (verde cheio) | 'secundario' (contorno) | 'perigo'
 */
export default function Botao({ titulo, onPress, variante = 'primario', carregando = false, desabilitado = false, style }) {
  const inativo = desabilitado || carregando;
  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      style={({ pressed }) => [
        estilos.base,
        variante === 'secundario' && estilos.secundario,
        variante === 'perigo' && estilos.perigo,
        pressed && { opacity: 0.8 },
        inativo && { opacity: 0.5 },
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={variante === 'secundario' ? cores.primaria : cores.branco} />
      ) : (
        <Text style={[estilos.texto, variante === 'secundario' && { color: cores.primaria }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    backgroundColor: cores.primaria,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  secundario: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: cores.primaria,
  },
  perigo: {
    backgroundColor: cores.erro,
  },
  texto: {
    color: cores.branco,
    fontSize: 16,
    fontWeight: '600',
  },
});
