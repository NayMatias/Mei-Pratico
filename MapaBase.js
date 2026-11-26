import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

const MapaBase = forwardRef(function MapaBase({ children, style, ...props }, ref) {
  return (
    <View style={[{ flex: 1 }, style]}>
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        mapType="standard"
        showsUserLocation
        showsMyLocationButton
        {...props}
      >
        {children}
      </MapView>
      <View style={estilos.atribuicao} pointerEvents="none">
        <Text style={estilos.atribuicaoTexto}>Rotas: OSRM · dados © OpenStreetMap</Text>
      </View>
    </View>
  );
});

export default MapaBase;

const estilos = StyleSheet.create({
  atribuicao: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  atribuicaoTexto: { fontSize: 10, color: '#333' },
});
