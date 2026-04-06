/** CNT Quali-Fisio — o que o paciente realiza de forma independente */
export const CNT_QUALI_FISIO_ITENS: { id: string; label: string }[] = [
  { id: "1", label: "Restrito ao leito" },
  { id: "2", label: "Mudança de decúbito / CNT leito" },
  { id: "3", label: "Sedestação à beira do leito" },
  { id: "4", label: "Transferência para poltrona" },
  { id: "5", label: "Ortostatismo" },
  { id: "6", label: "Deambular > 10 passos" },
  { id: "7", label: "Deambular > 25 metros" },
  { id: "8", label: "Deambular > 100 metros" },
];

export const COMPLICACOES_PAG4: { id: string; label: string }[] = [
  { id: "pneumotorax", label: "Pneumotórax" },
  { id: "pneumomediastino", label: "Pneumomediastino" },
  { id: "sepse", label: "Sepse" },
  { id: "perfuracao_intestinal", label: "Perfuração intestinal" },
  { id: "derrame_pleural", label: "Derrame pleural" },
  { id: "hemorragia_pulmonar", label: "Hemorragia pulmonar" },
  { id: "hemorragia_vias_aereas", label: "Hemorragia de vias aéreas" },
  { id: "atelectasia", label: "Atelectasia" },
];

/** Texto de apoio (referência clínica — conferir tabela institucional) */
export const TEXTO_REF_PIMAX_PEMAX = `Valores preditos de PiMáx e PeMáx variam com sexo e idade; utilize as equações ou tabelas do serviço. Exemplos frequentes na literatura: em adultos, predição costuma incorporar idade (e às vezes IMC). Anote sempre os valores preditos utilizados.`;

export const TEXTO_REF_DINAMOMETRIA = `Pontos de corte para sarcopenia / fragilidade (ex. FAUTI) dependem de população e protocolo; registre os valores em kg e compare com referência local para ♂ e ♀.`;
