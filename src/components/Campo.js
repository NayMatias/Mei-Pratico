import { StyleSheet, Text, TextInput, View } from 'react-native';
import { cores } from '../theme/cores';

/** Campo de formulário com rótulo e mensagem de erro. */
export default function Campo({ rotulo, erro, obrigatorio = false, style, ...props }) {
  return (
    <View style={[estilos.container, style]}>
      {rotulo ? (
        <Text style={estilos.rotulo}>
          {rotulo}
          {obrigatorio ? <Text style={{ color: cores.erro }}> *</Text> : null}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={cores.textoSuave}
        style={[estilos.input, erro && { borderColor: cores.erro }, props.multiline && { minHeight: 80, textAlignVertical: 'top' }]}
        {...props}
      />
      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { marginBottom: 14 },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 6 },
  input: {
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: cores.texto,
  },
  erro: { color: cores.erro, fontSize: 13, marginTop: 4 },
});
