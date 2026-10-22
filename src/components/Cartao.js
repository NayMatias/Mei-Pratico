import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';

/** Cartão usado no menu principal e nas listas. */
export default function Cartao({ titulo, subtitulo, icone, etiqueta, onPress, desabilitado = false, children, style }) {
  const Conteudo = (
    <>
      <View style={estilos.linha}>
        {icone ? <Text style={estilos.icone}>{icone}</Text> : null}
        <View style={{ flex: 1 }}>
          <Text style={estilos.titulo}>{titulo}</Text>
          {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
        </View>
        {etiqueta ? (
          <View style={estilos.etiqueta}>
            <Text style={estilos.etiquetaTexto}>{etiqueta}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </>
  );

  if (!onPress) {
    return <View style={[estilos.cartao, style]}>{Conteudo}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      style={({ pressed }) => [estilos.cartao, pressed && { opacity: 0.85 }, desabilitado && { opacity: 0.55 }, style]}
    >
      {Conteudo}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  linha: { flexDirection: 'row', alignItems: 'center' },
  icone: { fontSize: 26, marginRight: 12 },
  titulo: { fontSize: 16, fontWeight: '700', color: cores.texto },
  subtitulo: { fontSize: 14, color: cores.textoSuave, marginTop: 2 },
  etiqueta: { backgroundColor: cores.primariaClara, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 },
  etiquetaTexto: { fontSize: 12, color: cores.primariaEscura, fontWeight: '600' },
});
