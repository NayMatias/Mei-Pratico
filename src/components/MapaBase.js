/**
 * Mapa base do aplicativo com camada do OpenStreetMap.
 * Etapa 4 do cronograma (15/09 a 28/09).
 */
import { forwardRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';

const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const MapaBase = forwardRef(function MapaBase({ children, style, ...props }, ref) {
  return (
    <View style={[{ flex: 1 }, style]}>
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        // No Android, "none" esconde o mapa padrão e deixa só os blocos do OpenStreetMap
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
        showsUserLocation
        showsMyLocationButton
        {...props}
      >
        <UrlTile urlTemplate={OSM_TILES} maximumZ={19} flipY={false} shouldReplaceMapContent />
        {children}
      </MapView>
      {/* Atribuição obrigatória pelos termos de uso do OpenStreetMap */}
      <View style={estilos.atribuicao} pointerEvents="none">
        <Text style={estilos.atribuicaoTexto}>© colaboradores do OpenStreetMap</Text>
      </View>
    </View>
  );
});

export default MapaBase;

const estilos = StyleSheet.create({
  atribuicao: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  atribuicaoTexto: { fontSize: 10, color: '#333' },
});
