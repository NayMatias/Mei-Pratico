import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Linking } from 'react-native';

import { montarReciboHTML, montarTextoNFSe, numeroRecibo, URL_EMISSOR_NACIONAL } from '../utils/documentos';

export async function gerarECompartilharRecibo(atendimento, prestador) {
  const html = montarReciboHTML(atendimento, prestador);
  const { uri } = await Print.printToFileAsync({ html });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento não está disponível neste aparelho.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Recibo nº ${numeroRecibo(atendimento.id)}`,
    UTI: 'com.adobe.pdf',
  });
  return uri;
}

export async function copiarDadosNFSe(atendimento, prestador) {
  await Clipboard.setStringAsync(montarTextoNFSe(atendimento, prestador));
}

export function abrirEmissorNacional() {
  return Linking.openURL(URL_EMISSOR_NACIONAL);
}
