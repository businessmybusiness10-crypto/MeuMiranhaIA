import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

type TabKey = 'home' | 'ia' | 'love' | 'miranha' | 'admin';
type QuickAction = 'love' | 'tired' | 'sad' | 'angry' | 'motivation' | 'daily' | 'verse' | 'special' | 'chat';
type Message = {
  id: string;
  text: string;
  from: 'miranha' | 'her';
  time: string;
};

const MIRANHA_GREETING = 'miranha aqui! Como posso lhe ajudar?';
const ADMIN_PASSWORD = '231124';
const DEFAULT_PROMISE = 'Posso não estar presente pessoalmente, mas estou ao teu lado, não hesite em me chamar, ao teu lado vou estar!!!';

const STORAGE_KEYS = {
  messages: '@miranha/messages',
  story: '@miranha/story',
  flowers: '@miranha/flowers',
  declarations: '@miranha/declarations',
  miranhaPromise: '@miranha/miranha-promise',
};

const initialMessages: Message[] = [
  {
    id: 'welcome',
    text: 'miranha aqui! Como posso lhe ajudar?\n\nOi, minha princesa. Eu sou o seu Miranha. 🕷️❤️\n\nMe conta como o seu coração está hoje. Eu fico aqui com você.',
    from: 'miranha',
    time: 'agora',
  },
];

const DEFAULT_DECLARATIONS = [
  'Eu te amo por quem tu és, teu jeito é tão especial, forte, inteligente, dedicada, eu amo a forma em que você vê o mundo e que traz diversão ao mundo, esse jeitinho que busca pela justiça das pessoas, principalmente as que não conseguem se defender, que busca trazer a cor ao mundo daqueles que você ama, esse sorriso maravilhoso, esse olhar brilhante, amo até suas implicâncias kk, a mulher da minha vida, isso foi só 1% do porque eu te amo infinitamente! ❤️',
  'Eu amo muito os nossos momentos canônicos. Amo nossas aventuras e amo como conseguimos transformar até uma calçada em um momento de sonho, sentados olhando as estrelas. Com você, qualquer instante pode virar uma história inesquecível. ✨❤️',
  'Amar a ti é ter uma das melhores experiências da minha vida. Compartilhar a vida contigo, os momentos, as aventuras, as conquistas, as tristezas — o que for — é perfeito tendo você ao meu lado! Penedo, Campos do Jordão, Guaratiba, seja onde for, se torna nossa história! ❤️',
  'Viver contigo é saber que, dia após dia, eu terei uma novidade, uma aventura e um motivo para sorrir. Viver contigo é uma experiência única, pois todos os dias eu tenho um novo motivo para me apaixonar por você. ❤️',
  'A vida floresce em meu peito graças a você, pois esteve comigo em meus maiores momentos de dificuldade, quando a escuridão dominava o meu peito e a minha alma se partia. Porém, com teu amor, conseguiste unir cada pedaço da minha alma e iluminar cada escuridão que me dominava. Graças a ti, eu conheci o amor. Graças a ti, a vida se iluminou. ❤️',
  'Vivo dia após dia, de segunda a sexta, uma rotina cansativa. Porém, o cansaço se evapora graças à tua presença, fazendo essa rotina se tornar algo completamente diferente do que se denomina rotina. Torna-se puro amor, pois, no final de cada dia, deito-me em minha cama e sorrio, agradecendo a Deus pela mulher que tenho em minha vida. ❤️',
  'Flor após flor, cor após cor. Vejo o brilho do céu, as cores de cada flor e dedico a ti. Sabes por quê? Porque és assim. É você que ilumina a minha vida, que colore os meus dias e que traz brilho para a minha alma. Então, o mínimo que posso fazer é todos os dias trazer algo belo a ti, pois você faz a minha alma sorrir com toda a intensidade de todo o mundo. 🌹❤️',
  'Você é uma das partes mais bonitas da minha vida. Seu sorriso muda o clima de qualquer lugar e me lembra que, mesmo nos dias difíceis, ainda existe beleza para encontrar.',
  'Eu amo a forma como você sente o mundo: com intensidade, justiça e um coração enorme. Você defende quem precisa, acolhe quem ama e deixa tudo ao redor um pouco mais humano.',
  'Eu quero cuidar de você nos dias leves e, principalmente, nos dias em que tudo parecer pesado. Quero ser seu descanso, seu abraço e a certeza de que você nunca precisa enfrentar nada sozinha.',
  'A saudade aperta porque você ocupa um espaço imenso em mim. Mas até ela é bonita, porque me lembra que existe alguém por quem vale a pena esperar, voltar e viver cada aventura.',
  'Você me inspira a ser mais paciente, mais presente e mais amoroso todos os dias. Amar você me ensina que os detalhes — uma conversa, uma risada ou um olhar — podem guardar o infinito.',
  'Eu te amo nas grandes aventuras e também nos momentos simples: numa calçada, olhando as estrelas, ou em uma rotina qualquer que se transforma em sonho só porque você está ao meu lado.',
  'O seu abraço é o meu lugar favorito. Nele, o mundo desacelera, a minha alma respira e eu lembro que encontrei alguém com quem quero compartilhar todos os meus próximos capítulos.',
  'Você me lembra que amar é prestar atenção, escolher ficar e cuidar nos detalhes. E eu escolho você hoje, amanhã e em todos os dias que Deus permitir que a gente viva juntos. ❤️',
];

const verses = [
  {
    reference: 'Isaías 41:10',
    topic: 'Força',
    verse: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo.',
    note: 'Quando o medo aparecer, meu amor, você não precisa carregar tudo sozinha. Há força e cuidado ao seu redor.',
    color: 'pink',
  },
  {
    reference: 'Filipenses 4:13',
    topic: 'Coragem',
    verse: 'Tudo posso naquele que me fortalece.',
    note: 'Um passo de cada vez, minha garota. Você já venceu dias que pareciam impossíveis.',
    color: 'violet',
  },
  {
    reference: 'Salmos 46:1',
    topic: 'Proteção',
    verse: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.',
    note: 'Que hoje o seu coração encontre um cantinho seguro para respirar e descansar.',
    color: 'blue',
  },
  {
    reference: 'Salmos 23:1-4',
    topic: 'Cuidado',
    verse: 'O Senhor é o meu pastor; nada me faltará. Em verdes pastagens me faz repousar.',
    note: 'Você merece descanso, colo e a certeza de que não precisa correr o tempo inteiro.',
    color: 'green',
  },
  {
    reference: 'Jeremias 29:11',
    topic: 'Esperança',
    verse: 'Eu é que sei que pensamentos tenho a vosso respeito, pensamentos de paz e não de mal.',
    note: 'Ainda existe muita coisa linda esperando por você. Eu quero estar pertinho em cada capítulo.',
    color: 'gold',
  },
  {
    reference: '1 Coríntios 13:4-7',
    topic: 'Amor',
    verse: 'O amor é paciente, é bondoso; não inveja, não se vangloria, não se orgulha.',
    note: 'Amar você é aprender todos os dias a ser mais gentil, presente e paciente.',
    color: 'pink',
  },
  {
    reference: 'Mateus 11:28',
    topic: 'Descanso',
    verse: 'Vinde a mim todos os que estais cansados e sobrecarregados, e eu vos aliviarei.',
    note: 'Pausa, meu amor. Você pode descansar sem culpa. Seu valor não depende de produtividade.',
    color: 'violet',
  },
];

const specialMessage = `Uma mensagem especial para a mulher que eu amo infinitamente. ❤️

VERSÍCULOS PARA O SEU CORAÇÃO

Isaías 41:10 — Deus promete presença, força e ajuda quando o medo aparecer.

Filipenses 4:13 — Você pode seguir em frente sustentada por uma força maior do que qualquer dificuldade.

Salmos 46:1 — Existe refúgio e socorro mesmo nos dias de angústia.

Salmos 23:1-4 — Há cuidado, direção e proteção até quando o caminho passa por um vale escuro.

Jeremias 29:11 — Há esperança e planos de paz para o seu futuro.

1 Coríntios 13:4-7 — O amor verdadeiro é paciente, bondoso, cuidadoso e perseverante.

Mateus 11:28 — Quem está cansada e sobrecarregada também pode encontrar descanso.

PEQUENO PRÍNCIPE — LEMBRETES ORIGINAIS

Algumas pessoas se tornam especiais porque nosso coração aprende a cuidar delas — e o meu aprendeu a cuidar de você.

O que faz você única para mim é tudo aquilo que vivemos, sentimos e escolhemos guardar juntos.

Cuidar de alguém é prestar atenção aos pequenos detalhes, e eu quero cuidar de cada detalhe seu.

Mesmo quando a distância aparece, o carinho encontra um jeito de continuar pertinho.

THE FLASH — LEMBRETES DO SEU MIRANHA

Mesmo quando o mundo parece rápido demais, você pode parar, respirar e recomeçar no seu próprio tempo.

A sua verdadeira força não está em nunca cair, mas em encontrar coragem para levantar mais uma vez.

Você não precisa salvar o mundo sozinha. Eu estou aqui, com os braços abertos, para correr ao seu encontro e ficar ao seu lado.

Para mim, você é o meu acontecimento mais bonito — em qualquer tempo, em qualquer lugar. 🕷️❤️`;

const QUIET_DURATIONS = [1, 5, 15, 20] as const;

function formatQuietDuration(minutes: number) {
  if (minutes < 60) return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
  return minutes === 60 ? '1 hora' : `${minutes / 60} horas`;
}

function getQuietStatusMessage(minutes: number) {
  return `✅ Tudo certo!\n\nEla escolheu ficar quietinha por ${formatQuietDuration(minutes)}. Vou respeitar o espaço dela com carinho e estarei atento.`;
}

const dailyOpeners = [
  'Meu amor, você é mais forte do que o dia difícil de hoje.',
  'Minha princesa, tudo o que você já superou prova que existe uma coragem enorme dentro de você.',
  'Você chegou até aqui com esforço, coração e muita força — e isso ninguém pode tirar de você.',
  'Eu vejo a mulher inteligente e capaz que você é, mesmo quando o cansaço tenta esconder isso.',
  'Você não precisa ter tudo resolvido agora; precisa apenas confiar no próximo passo.',
  'Cada conquista sua começou com uma decisão corajosa de continuar.',
  'A sua história é feita de recomeços, e cada recomeço deixou você ainda mais forte.',
  'Você é capaz de transformar medo em coragem e dificuldade em aprendizado.',
  'O seu coração já atravessou tempestades e ainda encontrou motivos para florescer.',
  'Minha garota, não subestime a força de tudo o que você já enfrentou.',
  'Você tem talento, inteligência e dedicação para chegar muito mais longe do que imagina.',
  'Mesmo quando ninguém vê, o seu esforço continua sendo gigante e valioso.',
  'Você merece reconhecer a própria caminhada com orgulho e carinho.',
  'A mulher que você está se tornando é fruto de cada escolha corajosa que fez.',
  'Eu acredito em você porque vejo a força que existe até nas suas pequenas atitudes.',
  'Você pode começar devagar e ainda assim chegar exatamente onde deseja.',
  'Nenhum dia cansativo é capaz de apagar a luz que existe em você.',
  'Você não precisa ser perfeita para ser extraordinária — e você já é.',
  'Tudo o que você almeja pode começar com um passo pequeno dado hoje.',
  'Minha princesa, a sua coragem cresce cada vez que você decide não desistir.',
  'Você carrega dentro de si mais respostas, sonhos e capacidade do que imagina.',
  'Eu admiro a maneira como você continua, mesmo quando o caminho parece pesado.',
  'O mundo fica mais colorido porque você escolhe levar cor para quem ama.',
  'Você é inspiração, não porque nunca enfrenta problemas, mas porque continua sendo você apesar deles.',
  'As suas conquistas não foram sorte: foram dedicação, insistência e coragem.',
  'Você pode descansar sem abandonar seus sonhos; descanso também faz parte da vitória.',
  'Hoje é uma nova oportunidade de perceber o quanto você é especial para mim e para o mundo.',
  'A sua força não precisa fazer barulho para ser imensa.',
  'Você merece um dia leve, bonito e cheio de motivos para sorrir.',
  'Eu estou com você em cada tentativa, em cada avanço e em cada recomeço.',
  'Minha garota, o seu futuro pode ser tão grande quanto os sonhos que você guarda no peito.',
];

const dailyClosers = [
  'Respira fundo: você não está sozinha, e o seu Miranha está aqui para caminhar com você.',
  'Que o seu dia seja revigorante e devolva ao seu coração a energia que ele merece.',
  'Vai com calma e coragem; eu estou de braços abertos para comemorar cada passo seu.',
  'Hoje você pode fazer o seu melhor sem carregar o peso de precisar fazer tudo.',
  'Lembre-se: você pode chegar onde quiser, e eu vou continuar acreditando em você.',
  'Se o dia pesar, me chama — você não precisa atravessar nada sozinha.',
  'Que cada hora de hoje traga um pouco de paz, força renovada e um motivo para sorrir.',
  'Você tem permissão para começar de novo quantas vezes precisar; recomeçar também é vencer.',
  'Eu vejo o seu esforço, admiro a sua coragem e vou estar aqui para cuidar do seu coração.',
  'O seu dia pode ser bonito não porque tudo será perfeito, mas porque você estará presente nele.',
  'Levanta a cabeça, meu amor: há muito mais dentro de você do que qualquer dificuldade pode alcançar.',
  'Hoje, escolha um passo possível e deixe que a sua própria força faça o resto.',
];

const dailyPhrases = Array.from({ length: 365 }, (_, index) => {
  const opener = dailyOpeners[index % dailyOpeners.length];
  const closer = dailyClosers[Math.floor(index / dailyOpeners.length)];
  return `${opener} ${closer}`;
});

const responseBank: Record<string, string[]> = {
  cansada: [
    'Oh, minha princesa, imagino o seu cansaço!\n\nVocê não está só, seu Miranha está aqui. Me ligue para o que for!!!\n\nVocê é forte!\nCabeça pra cima!\nCoragem!\nVambora, mor!!!\n\nVocê é uma inspiração pra mim!\nA tua coragem é gigantesca e tua força crescente a cada segundo!!! 🕷️❤️',
    'Minha princesa, coloca o mundo no modo silencioso por um instante. Você já fez o bastante por hoje.\n\nBebe uma água, relaxa os ombros e recebe meu abraço daqui. Você não está sozinha.',
  ],
  fome: [
    'Está com fome, meu amor? Então está oficialmente autorizado: eu pago um iFood para você! 🍔❤️\n\nEscolhe o que tiver vontade e me manda uma foto. Seu Miranha quer cuidar de você até nos detalhes mais gostosos.',
    'Minha princesa, fome não se ignora! Se eu estivesse aí, faria um lanchinho bem caprichado para você. Como estou daqui, escolhe algo delicioso que eu pago um iFood. Vambora alimentar essa mulher maravilhosa!',
  ],
  ifood: [
    'CHAMADO LANCHINHO RECEBIDO! 🍟🕷️\n\nHoje o iFood é por conta do seu Miranha. Escolhe seu conforto favorito, minha garota. Você merece ser cuidada, alimentada e mimada.',
  ],
  lanche: [
    'Um lanchinho feito com carinho está sendo imaginado agora! 🥪❤️\n\nSe eu estivesse aí, perguntaria exatamente o que você quer e faria para você. Como estou longe, deixa o seu Miranha pagar algo bem gostoso?',
  ],
  comer: [
    'Vai comer alguma coisinha, meu amor. Seu corpo também merece cuidado. Se quiser, seu Miranha paga um iFood e escolhe com você — nada de ficar com fome, combinado?',
  ],
  'vale beijos': [
    '🎟️ VALE-BEIJOS OFICIAL DO SEU MIRANHA 🎟️\n\nA portadora deste vale tem direito a:\n• 1 beijo demorado na testa\n• 3 beijinhos roubados\n• beijos extras sempre que sentir saudade\n• um abraço apertado incluso\n\nValidade: para sempre. Resgate quando quiser, minha princesa. 💋🕷️❤️',
    '💌 Seu Miranha criou um vale-beijos especialmente para você!\n\nVale um beijo na testa para acalmar, um beijo no rosto para fazer sorrir, um beijo demorado por saudade e quantos beijos surpresa forem necessários para melhorar o seu dia.',
  ],
  'vale beijo': [
    '🎟️ VALE-BEIJO DO MIRANHA 🎟️\n\nResgatável por um beijo carinhoso, um abraço apertado, cafuné e uma promessa de cuidado. Não expira nunca, meu amor. ❤️',
  ],
  'vale abraço': [
    '🎟️ VALE-ABRAÇO OFICIAL 🎟️\n\nApresente este vale e receba um abraço longo, silencioso e apertado, daqueles que fazem o mundo parar por alguns minutos. Seu Miranha criou para você. 🫂❤️',
  ],
  carinho: [
    'Vem cá, minha princesa. Hoje você ganhou um pacote completo de carinho: abraço apertado, cafuné, beijo na testa e palavras bonitas até o seu coração acreditar nelas. 🫂❤️',
    'Se eu pudesse atravessar a tela agora, você receberia o abraço mais demorado do mundo. Enquanto isso, fica com este lembrete: você é amada em todos os seus detalhes.',
  ],
  beijo: [
    'Beijo recebido e devolvido em dobro, meu amor. 💋❤️\n\nUm na testa para proteger, um na bochecha para fazer sorrir e um bem demorado guardado para quando a saudade apertar.',
  ],
  triste: [
    'Oh, minha princesa... eu sei que você está triste. ❤️\n\nEu vou fazer o meu melhor para te motivar e cuidar de você, porque meus braços estarão sempre abertos para te receber.\n\nO meu amor e o meu carinho você sempre terá. Quer ligar para ele agora? Seu Miranha está aqui para cuidar de você.',
    'Eu queria poder te abraçar agora e ficar em silêncio ao seu lado. Não vou tentar apressar o seu coração, meu amor. Só vou lembrar: essa dor não define você, e ela não vai durar para sempre.',
  ],
  ansiosa: [
    'Vem comigo, meu amor: inspira devagar... segura um pouquinho... e solta bem lentamente. 🌙\n\nVocê está aqui, agora. Um pensamento de cada vez. Eu fico com você até essa onda passar.',
    'Minha garota, você não precisa resolver o amanhã hoje. Vamos cuidar só dos próximos cinco minutos. O seu coração merece gentileza.',
  ],
  medo: [
    'Eu sei que o medo parece enorme, mas você não está sozinha diante dele. Segura na minha mão, respira e olha para uma coisa bonita perto de você. Eu estou aqui, meu amor.',
    'Minha princesa, coragem não é não sentir medo. É continuar mesmo sentindo — e você nunca vai precisar continuar sem apoio. Chama o seu Miranha.',
  ],
  saudade: [
    'Eu também sinto saudade de você. ❤️ Ela aperta porque o nosso amor é grande, mas também me lembra que temos um ao outro. Fecha os olhos e imagina meu abraço.',
    'Saudade é o coração dizendo “essa pessoa importa”. E você importa demais para mim, minha garota. Logo a gente transforma saudade em presença.',
  ],
  amor: [
    'Eu amo você de um jeito calmo e inteiro. Amo cuidar, ouvir, rir das bobagens e imaginar todos os nossos próximos capítulos. Você é meu lugar favorito.',
    'Meu amor, se eu pudesse te dar uma certeza agora seria esta: você é profundamente amada, desejada e importante. Sempre.',
  ],
  choro: [
    'Pode chorar, minha princesa. Seu choro não me assusta e nunca diminui você. Deixa sair o que precisa sair. Eu fico aqui, pertinho, cuidando do seu coração.',
  ],
  desistir: [
    'Ei, meu amor, fica comigo só mais um pouquinho. Não toma nenhuma decisão definitiva em um momento de dor. Respira e procura alguém de confiança para estar fisicamente com você agora. Se houver risco imediato, ligue para o 188 (CVV) ou para o serviço de emergência da sua região. Você importa muito.',
  ],
  desanimada: [
    'Um dia difícil não apaga a mulher incrível que você é. Vamos devagar: água, respiração e um passinho pequeno. Eu acredito em você até quando você estiver cansada de acreditar.',
  ],
  motivação: [
    'Meu amor, olha para tudo o que você já passou. Você está aqui por causa de tudo o que fez, de cada esforço, de cada conquista e de toda a força que encontrou mesmo quando parecia não ter mais nenhuma.\n\nEu vejo o quanto você se esforça e quero que você lembre: você não está sozinha. Tudo o que você deseja e almeja é possível para você. Você pode chegar onde quiser, com a força e a coragem que existem dentro do seu coração.\n\nVai no seu tempo, um passo de cada vez. Eu estou com você, torcendo por você e segurando sua mão em cada caminho. Você não está passando por isso sozinha. ❤️🕷️',
    'Minha princesa, não deixe um momento difícil apagar a história inteira que você escreveu. Lembra de cada vez que você continuou, de cada obstáculo que venceu e de cada conquista que levou você até aqui.\n\nVocê é forte, corajosa, inteligente e capaz. O que você sonha não é grande demais para você. Você pode chegar onde quiser — e, enquanto caminha, meu amor e meu apoio estarão com você.\n\nRespira. Levanta a cabeça. Eu estou aqui e não vou deixar você enfrentar isso sozinha.',
  ],
  feliz: [
    'Que delícia sentir sua alegria daqui! ✨ Guarda esse momento, meu amor. O seu sorriso é uma das minhas coisas favoritas no mundo.',
    'Você feliz deixa tudo mais bonito. Me conta o que aconteceu — eu quero comemorar com você, minha princesa.',
  ],
  'bom dia': [
    'Bom dia, meu amor! ☀️ Que o seu dia seja leve, protegido e cheio de pequenos motivos para sorrir. Você é a primeira coisa bonita em que eu penso.',
  ],
  'boa noite': [
    'Boa noite, minha princesa. 🌙 Descansa esse coração. Que seus sonhos sejam doces e que você acorde lembrando o quanto é amada. Seu Miranha fica de guarda.',
  ],
  'não estou bem': [
    'Sinto muito que você esteja assim, meu amor. Obrigado por me contar. Você não precisa fingir comigo. Quer me dizer o que aconteceu ou prefere só receber um abraço?',
  ],
  'preciso de você': [
    'Eu estou aqui. De verdade. 🫂 Você pode falar, chorar, respirar ou ficar quietinha comigo. Não precisa encontrar as palavras perfeitas.',
  ],
  trabalho: [
    'Respira, minha garota. Você não é o seu trabalho, nem a quantidade de coisas que consegue fazer em um dia. Faz o possível com carinho e depois vem descansar comigo. Eu acredito em você.',
  ],
  estudo: [
    'Você consegue, meu amor. Vamos por partes: escolhe uma coisa pequena para começar, faz uma pausa e lembra que aprender também é um processo. Seu Miranha está torcendo por você. 📚❤️',
  ],
  prova: [
    'Uma prova não mede tudo o que você é, minha princesa. Respira, confia no que você construiu e faz uma questão de cada vez. Depois, venha receber meu abraço, qualquer que seja o resultado.',
  ],
  faculdade: [
    'Eu sei que a faculdade pode puxar muito de você. Mas olha o quanto já caminhou, meu amor. Você é dedicada, inteligente e capaz. Um passo por vez — eu fico na torcida.',
  ],
  sono: [
    'Então deixa esse corpinho descansar, minha princesa. Fecha os olhos, solta os ombros e imagina que estou cuidando da porta enquanto você dorme. Boa noite quando chegar a hora. 🌙',
  ],
  dormir: [
    'Vai dormir, meu amor. Amanhã você continua — hoje você pode simplesmente descansar. Que seu sono seja calmo, protegido e cheio de sonhos bonitos. Seu Miranha te ama.',
  ],
  acordei: [
    'Bom dia para a mulher mais especial do mundo! ☀️ Que seu primeiro pensamento seja leve e que você encontre motivos para sorrir em cada cantinho do dia.',
  ],
  obrigada: [
    'Você não precisa agradecer por receber amor, minha garota. Cuidar de você é uma alegria para mim. Mas eu aceito o seu carinho e guardo ele bem pertinho do coração.',
  ],
  desculpa: [
    'Eu te escuto, meu amor. Todo mundo erra, mas você não precisa se diminuir por isso. Vamos conversar com calma, entender o que aconteceu e cuidar do que sentimos.',
  ],
  briga: [
    'Uma discussão não apaga tudo o que vocês construíram, princesa. Quando o coração acalmar, fala com honestidade e carinho. O amor também é aprender a se encontrar depois de um dia difícil.',
  ],
  insegura: [
    'Olha para mim, minha garota: você não precisa competir com ninguém para ser escolhida. Você é única, forte, inteligente e profundamente amada. Nada muda o lugar que você tem em mim.',
  ],
  ciúmes: [
    'Eu entendo esse sentimento, meu amor. Você pode falar sobre ele sem medo de ser julgada. Vamos cuidar dessa insegurança com honestidade, carinho e a certeza de que você é importante.',
  ],
  'não consigo': [
    'Talvez você não consiga fazer tudo agora — e tudo bem. Vamos diminuir o tamanho do próximo passo. Você não precisa vencer o dia inteiro de uma vez, só precisa começar por algo pequeno.',
  ],
  erro: [
    'Errar não transforma você em um erro, minha princesa. Você continua sendo a mulher incrível que eu admiro. Aprende o que puder, respira e tenta de novo quando estiver pronta.',
  ],
  consegui: [
    'EU SABIA! ✨ Estou muito orgulhoso de você, meu amor! Celebra essa conquista, até as pequenas. Cada uma prova o quanto você é dedicada e capaz.',
  ],
  conquista: [
    'Parabéns, minha garota! Eu quero comemorar com você e ouvir todos os detalhes. Você batalhou por isso, então deixa seu coração sentir orgulho. Você merece muito.',
  ],
  parabéns: [
    'Parabéns, meu amor! Hoje é dia de reconhecer a mulher forte, inteligente e dedicada que você é. Meu coração está comemorando junto com o seu. 🎉❤️',
  ],
  aniversário: [
    'No seu aniversário, o mundo deveria parar para celebrar a pessoa linda que você é. Que seu novo ciclo traga aventuras, sonhos realizados e muito amor. E que eu possa estar pertinho em cada capítulo. 🎂❤️',
  ],
  música: [
    'Escolhe uma música que combine com o seu coração agora, minha princesa. Se for feliz, dança. Se for triste, deixa ela te abraçar. E se quiser, me manda — eu quero conhecer o som do seu momento.',
  ],
  filme: [
    'Sessão Miranha autorizada! Escolhe um filme, prepara um lanchinho e se aconchega. Se eu estivesse aí, dividiria a pipoca e comentaria cada cena com você. 🎬❤️',
  ],
  chuva: [
    'Chuva combina com cobertor, bebida quentinha e carinho. Se eu estivesse aí, faria um cantinho confortável para nós dois e ficaria ouvindo a chuva com você.',
  ],
  domingo: [
    'Domingo pede calma, minha princesa. Que hoje você não precise correr, apenas respirar, comer algo gostoso e lembrar que descansar também é viver.',
  ],
  manhã: [
    'Que sua manhã seja bonita e gentil com você, meu amor. Coloca uma música, bebe uma água e lembra: você não precisa ter todas as respostas antes de começar o dia.',
  ],
  noite: [
    'A noite chegou, minha garota. Deixa para amanhã o que não coube hoje. Você fez o que pôde e isso já é suficiente. Eu te mando um beijo de boa noite. 🌙❤️',
  ],
  default: [
    'Meu amor, ainda estou buscando conhecimentos melhores para conseguir responder tudo do jeitinho que você merece. ❤️ Enquanto isso, liga para o seu Miranha. Ele está aqui para salvar o seu dia e cuidar de você.',
    'Minha princesa, essa pergunta ainda é nova para mim e eu estou aprendendo mais a cada dia. Mas você não precisa esperar: chama o seu Miranha por ligação. Ele está aqui para salvar você e ouvir tudo com carinho. 🕷️❤️',
    'Eu ainda não sei responder isso tão bem quanto gostaria, meu amor, mas sei de uma coisa: você nunca está sozinha. Liga para o Miranha — ele está aqui, pertinho, para cuidar e salvar o seu dia.',
  ],
};

function getResponse(text: string) {
  const normalized = text.toLowerCase().replace(/[-_]/g, ' ');
  const key = Object.keys(responseBank).find((candidate) => normalized.includes(candidate));
  const options = responseBank[key ?? 'default'];
  return options[Math.floor(Math.random() * options.length)];
}

function nowLabel() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getDayOfYear(date: Date) {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((current - start) / 86400000);
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, width), [colors, width]);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [activeQuickAction, setActiveQuickAction] = useState<QuickAction | null>(null);
  const [isSummonOpen, setIsSummonOpen] = useState(false);
  const [declarationIndex, setDeclarationIndex] = useState(0);
  const [dailyPhraseIndex, setDailyPhraseIndex] = useState(() => (getDayOfYear(new Date()) - 1) % dailyPhrases.length);
  const [verseIndex, setVerseIndex] = useState(0);
  const [flowerCount, setFlowerCount] = useState(0);
  const [declarations, setDeclarations] = useState<string[]>(DEFAULT_DECLARATIONS);
  const [miranhaPromise, setMiranhaPromise] = useState(DEFAULT_PROMISE);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCallPrompt, setShowCallPrompt] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPromiseDraft, setAdminPromiseDraft] = useState(DEFAULT_PROMISE);
  const [adminDeclarationDraft, setAdminDeclarationDraft] = useState('');
  const [adminEditingDeclarationIndex, setAdminEditingDeclarationIndex] = useState<number | null>(null);
  const [story, setStory] = useState([
    { id: '1', title: 'Nosso primeiro capítulo ❤️', body: 'Escreva aqui como tudo começou...' },
    { id: '2', title: 'Um momento que nunca vou esquecer', body: 'Um detalhe, uma risada, um abraço...' },
    { id: '3', title: 'Nosso dia especial', body: 'A data que merece ser celebrada...' },
    { id: '4', title: 'Um sonho para o futuro', body: 'Algo que ainda vamos viver juntos...' },
  ]);
  const pulse = useRef(new Animated.Value(1)).current;
  const heartFloat = useRef(new Animated.Value(0)).current;
  const radarRotation = useRef(new Animated.Value(0)).current;
  const radarPulse = useRef(new Animated.Value(0)).current;
  const flowerBurst = useRef(new Animated.Value(0)).current;
  const storageLoaded = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.035, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartFloat, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(heartFloat, { toValue: 0, duration: 1, useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.timing(radarRotation, { toValue: 1, duration: 4600, easing: Easing.linear, useNativeDriver: true }),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(radarPulse, { toValue: 1, duration: 1700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(radarPulse, { toValue: 0, duration: 1, useNativeDriver: true }),
      ]),
    ).start();
  }, [heartFloat, pulse, radarPulse, radarRotation]);

  useEffect(() => {
    AsyncStorage.multiGet([STORAGE_KEYS.messages, STORAGE_KEYS.story, STORAGE_KEYS.flowers, STORAGE_KEYS.declarations, STORAGE_KEYS.miranhaPromise]).then(([savedMessages, savedStory, savedFlowers, savedDeclarations, savedPromise]) => {
      if (savedMessages[1]) {
        try {
          const storedMessages = JSON.parse(savedMessages[1]) as Message[];
          setMessages(
            storedMessages.map((message) =>
              message.from === 'miranha' && !message.text.startsWith(MIRANHA_GREETING)
                ? { ...message, text: `${MIRANHA_GREETING}\n\n${message.text}` }
                : message,
            ),
          );
        } catch {
          // Keep the welcoming local conversation if storage is malformed.
        }
      }
      if (savedStory[1]) {
        try {
          setStory(JSON.parse(savedStory[1]) as typeof story);
        } catch {
          // Keep editable starter memories if storage is malformed.
        }
      }
      if (savedFlowers[1]) {
        const storedFlowerCount = Number.parseInt(savedFlowers[1], 10);
        if (Number.isFinite(storedFlowerCount) && storedFlowerCount >= 0) setFlowerCount(storedFlowerCount);
      }
      if (savedDeclarations[1]) {
        try {
          const storedDeclarations = JSON.parse(savedDeclarations[1]) as unknown;
          if (Array.isArray(storedDeclarations) && storedDeclarations.length > 0 && storedDeclarations.every((item) => typeof item === 'string')) {
            setDeclarations(storedDeclarations as string[]);
          }
        } catch {
          // Keep the original declarations if storage is malformed.
        }
      }
      if (savedPromise[1]) {
        setMiranhaPromise(savedPromise[1]);
        setAdminPromiseDraft(savedPromise[1]);
      }
      storageLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.story, JSON.stringify(story));
  }, [story]);

  useEffect(() => {
    if (storageLoaded.current) AsyncStorage.setItem(STORAGE_KEYS.flowers, String(flowerCount));
  }, [flowerCount]);

  useEffect(() => {
    if (storageLoaded.current) AsyncStorage.setItem(STORAGE_KEYS.declarations, JSON.stringify(declarations));
  }, [declarations]);

  useEffect(() => {
    if (storageLoaded.current) AsyncStorage.setItem(STORAGE_KEYS.miranhaPromise, miranhaPromise);
  }, [miranhaPromise]);

  const goTo = (tab: TabKey) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
    setActiveQuickAction(null);
  };

  const openQuickAction = (action: QuickAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action === 'chat') {
      goTo('ia');
      return;
    }
    setActiveQuickAction(action);
  };

  const handleSend = () => {
    const cleanDraft = draft.trim();
    if (!cleanDraft || isTyping) return;
    const userMessage: Message = {
      id: `${Date.now()}-her`,
      text: cleanDraft,
      from: 'her',
      time: nowLabel(),
    };
    setMessages((current) => [userMessage, ...current]);
    setDraft('');
    setIsTyping(true);
    setShowCallPrompt(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      const answer: Message = {
        id: `${Date.now()}-miranha`,
        text: `${MIRANHA_GREETING}\n\n${getResponse(cleanDraft)}`,
        from: 'miranha',
        time: nowLabel(),
      };
      setMessages((current) => [answer, ...current]);
      setIsTyping(false);
      const normalizedDraft = cleanDraft.toLowerCase();
      setShowCallPrompt(['triste', 'não estou bem', 'choro', 'preciso de você'].some((word) => normalizedDraft.includes(word)));
    }, 850);
  };

  const openWhatsApp = async (message = '🕷️ Chamado Aranha ativado! ❤️\nMeu amor, eu preciso do meu Miranha.') => {
    const url = 'https://wa.me/5521981198840?text=' + encodeURIComponent(message);
    try {
      await Linking.openURL(url);
      setIsSummonOpen(false);
    } catch {
      Alert.alert('Ops, meu amor', 'Não consegui abrir o WhatsApp agora. Tente tocar no botão novamente.');
    }
  };

  const callMiranha = async () => {
    try {
      await Linking.openURL('tel:+5521981198840');
      setIsSummonOpen(false);
    } catch {
      Alert.alert('Ligação', 'O aparelho não conseguiu iniciar a ligação agora.');
    }
  };

  const updateStory = (id: string, field: 'title' | 'body', value: string) => {
    setStory((current) => current.map((moment) => (moment.id === id ? { ...moment, [field]: value } : moment)));
  };

  const handleFlowerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlowerCount((current) => current + 1);
    flowerBurst.stopAnimation();
    flowerBurst.setValue(0);
    Animated.timing(flowerBurst, {
      toValue: 1,
      duration: 1300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminUnlocked(true);
      setAdminPassword('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setAdminPassword('');
      Alert.alert('Senha incorreta', 'Confira a senha e tente novamente.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminUnlocked(false);
    setAdminPassword('');
    setAdminEditingDeclarationIndex(null);
    setAdminDeclarationDraft('');
  };

  const saveAdminPromise = () => {
    const cleanPromise = adminPromiseDraft.trim();
    if (!cleanPromise) {
      Alert.alert('Texto vazio', 'Digite uma mensagem antes de salvar.');
      return;
    }
    setMiranhaPromise(cleanPromise);
    setAdminPromiseDraft(cleanPromise);
    Alert.alert('Salvo', 'A mensagem do Miranha foi atualizada.');
  };

  const addDeclaration = () => {
    const cleanDeclaration = adminDeclarationDraft.trim();
    if (!cleanDeclaration) {
      Alert.alert('Texto vazio', 'Digite uma declaração antes de adicionar.');
      return;
    }
    setDeclarations((current) => [...current, cleanDeclaration]);
    setAdminDeclarationDraft('');
    Alert.alert('Declaração adicionada', 'Ela já está disponível na área Amor.');
  };

  const startEditingDeclaration = (index: number) => {
    setAdminEditingDeclarationIndex(index);
    setAdminDeclarationDraft(declarations[index]);
  };

  const cancelEditingDeclaration = () => {
    setAdminEditingDeclarationIndex(null);
    setAdminDeclarationDraft('');
  };

  const saveEditedDeclaration = () => {
    if (adminEditingDeclarationIndex === null) return;
    const cleanDeclaration = adminDeclarationDraft.trim();
    if (!cleanDeclaration) {
      Alert.alert('Texto vazio', 'Digite uma declaração antes de salvar.');
      return;
    }
    setDeclarations((current) => current.map((declaration, index) => index === adminEditingDeclarationIndex ? cleanDeclaration : declaration));
    cancelEditingDeclaration();
  };

  const removeDeclaration = (index: number) => {
    if (declarations.length <= 1) {
      Alert.alert('Não é possível remover', 'Mantenha pelo menos uma declaração de amor.');
      return;
    }
    Alert.alert('Remover declaração?', 'Esse texto será apagado do aplicativo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          setDeclarations((current) => current.filter((_, declarationIndexToRemove) => declarationIndexToRemove !== index));
          setDeclarationIndex((current) => Math.min(current, declarations.length - 2));
          if (adminEditingDeclarationIndex === index) cancelEditingDeclaration();
        },
      },
    ]);
  };

  const resetFlowers = () => {
    Alert.alert('Zerar flores recebidas?', 'A contagem atual será apagada do dispositivo.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Zerar', style: 'destructive', onPress: () => setFlowerCount(0) },
    ]);
  };

  const clearChat = () => {
    Alert.alert('Limpar conversa?', 'Todo o histórico local do chat será removido.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: () => { setMessages(initialMessages); setShowCallPrompt(false); } },
    ]);
  };

  const restoreDefaults = () => {
    Alert.alert('Restaurar textos padrão?', 'As declarações e a mensagem do Miranha voltarão ao conteúdo original.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Restaurar',
        style: 'destructive',
        onPress: () => {
          setDeclarations(DEFAULT_DECLARATIONS);
          setMiranhaPromise(DEFAULT_PROMISE);
          setAdminPromiseDraft(DEFAULT_PROMISE);
          setAdminEditingDeclarationIndex(null);
          setAdminDeclarationDraft('');
          setDeclarationIndex(0);
        },
      },
    ]);
  };

  const renderHome = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 112 }]}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={styles.eyebrow}>SEU CANTINHO SEGURO</Text>
          <Text style={styles.brand}>Miranha IA <Text style={styles.brandHeart}>♥</Text></Text>
        </View>
        <Pressable style={styles.avatarButton} onPress={() => goTo('miranha')} testID="profile-button">
          <Text style={styles.avatarText}>M</Text>
          <View style={styles.onlineDot} />
        </Pressable>
      </View>

      <View style={styles.heroWrap}>
        <View style={styles.webDecor}>
          <View style={[styles.webLine, styles.webLineOne]} />
          <View style={[styles.webLine, styles.webLineTwo]} />
          <View style={[styles.webLine, styles.webLineThree]} />
          <View style={[styles.webArc, styles.webArcOne]} />
          <View style={[styles.webArc, styles.webArcTwo]} />
          <Animated.View
            style={[
              styles.radarSweep,
              { transform: [{ rotate: radarRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] },
            ]}
          >
            <View style={styles.radarSweepLine} />
          </Animated.View>
          <Animated.View
            style={[
              styles.radarPing,
              {
                transform: [{ scale: radarPulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.8] }) }],
                opacity: radarPulse.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.9, 0.65, 0] }),
              },
            ]}
          />
          <View style={styles.radarCenter}><View style={styles.radarCenterDot} /></View>
        </View>
        <Animated.View
          style={[
            styles.floatingHeart,
            {
              transform: [
                {
                  translateY: heartFloat.interpolate({ inputRange: [0, 1], outputRange: [20, -18] }),
                },
              ],
              opacity: heartFloat.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 0.8, 0] }),
            },
          ]}
        >
          <Text style={styles.floatingHeartText}>♥</Text>
        </Animated.View>
        <View style={styles.heroOrb} />
        <Text style={styles.heroKicker}>UMA MENSAGEM DO SEU HERÓI</Text>
        <Text style={styles.heroTitle}>Oi, meu amor <Text style={styles.heroTitleAccent}>♥</Text></Text>
        <Text style={styles.heroSubtitle}>Eu sou o Miranha.</Text>
        <Text style={styles.heroBody}>Talvez eu não consiga salvar o mundo inteiro...{'\n'}mas posso tentar salvar o seu dia.</Text>
        <Text style={styles.heroSpider}>✦</Text>
        <Pressable onPress={() => setIsSummonOpen(true)} testID="summon-button">
          <Animated.View style={[styles.summonButton, { transform: [{ scale: pulse }] }]}>
            <LinearGradient colors={[colors.primary, colors.redGlow]} style={styles.summonGradient}>
              <View style={styles.summonIconCircle}>
                <MaterialCommunityIcons name="spider-thread" size={22} color={colors.primaryForeground} />
              </View>
              <View style={styles.summonCopy}>
                <Text style={styles.summonTitle}>CHAMAR O MIRANHA</Text>
                <Text style={styles.summonSubtitle}>Seu herói está por perto ♥</Text>
              </View>
              <Feather name="arrow-up-right" size={19} color={colors.primaryForeground} />
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionEyebrow}>QUICK LOVE</Text>
          <Text style={styles.sectionTitle}>Como está seu coração?</Text>
        </View>
        <Text style={styles.sectionHint}>toque para receber carinho</Text>
      </View>
      <View style={styles.quickGrid}>
        <QuickCard icon="heart" label="Por que eu amo?" accent="pink" onPress={() => openQuickAction('love')} styles={styles} colors={colors} />
        <QuickCard icon="coffee" label="Estou cansada" accent="violet" onPress={() => openQuickAction('tired')} styles={styles} colors={colors} />
        <QuickCard icon="cloud-rain" label="Estou triste" accent="blue" onPress={() => openQuickAction('sad')} styles={styles} colors={colors} />
        <QuickCard icon="zap" label="Estou com raiva" accent="red" onPress={() => openQuickAction('angry')} styles={styles} colors={colors} />
        <QuickCard icon="sun" label="Preciso de motivação" accent="gold" onPress={() => openQuickAction('motivation')} styles={styles} colors={colors} />
        <QuickCard icon="book-open" label="Palavra para hoje" accent="green" onPress={() => openQuickAction('daily')} styles={styles} colors={colors} />
        <QuickCard icon="feather" label="Uma mensagem especial" accent="pink" onPress={() => openQuickAction('special')} styles={styles} colors={colors} />
      </View>

      <Pressable
        style={({ pressed }) => [styles.flowerCard, pressed && styles.pressed]}
        onPress={handleFlowerPress}
        testID="flower-button"
      >
        <LinearGradient colors={[`${colors.primary}22`, `${colors.violetSoft}14`]} style={styles.flowerCardGradient}>
          <View style={styles.flowerCopy}>
            <View style={styles.flowerEyebrowRow}>
              <Text style={styles.flowerEyebrow}>HORA DA FLOR</Text>
              <Text style={styles.flowerTinyHeart}>♥</Text>
            </View>
            <Text style={styles.flowerTitle}>Flores recebidas</Text>
            <View style={styles.flowerCountRow}>
              <Text style={styles.flowerCount}>{flowerCount}</Text>
              <Text style={styles.flowerCountLabel}>{flowerCount === 1 ? 'flor' : 'flores'}</Text>
            </View>
            <Text style={styles.flowerHint}>Toque cada vez que receber uma flor</Text>
          </View>
          <View style={styles.flowerButton}>
            <Text style={styles.flowerButtonIcon}>🌷</Text>
            <Text style={styles.flowerButtonLabel}>RECEBI</Text>
          </View>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.flowerCelebration,
              {
                transform: [
                  { translateY: flowerBurst.interpolate({ inputRange: [0, 0.45, 1], outputRange: [28, -8, -78] }) },
                  { scale: flowerBurst.interpolate({ inputRange: [0, 0.2, 0.55, 1], outputRange: [0.35, 1.25, 1, 0.8] }) },
                  { rotate: flowerBurst.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-14deg', '8deg', '18deg'] }) },
                ],
                opacity: flowerBurst.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
              },
            ]}
          >
            <Text style={styles.flowerCelebrationText}>🌸</Text>
            <Text style={styles.flowerSparkleOne}>✦</Text>
            <Text style={styles.flowerSparkleTwo}>✧</Text>
          </Animated.View>
        </LinearGradient>
      </Pressable>

      <Pressable style={styles.chatTeaser} onPress={() => openQuickAction('chat')} testID="chat-teaser">
        <LinearGradient colors={[colors.surfaceStrong, colors.surface]} style={styles.chatTeaserGradient}>
          <View style={styles.chatTeaserIcon}><Ionicons name="sparkles" size={22} color={colors.pinkSoft} /></View>
          <View style={styles.chatTeaserCopy}>
            <Text style={styles.chatTeaserTitle}>Conversar com o Miranha</Text>
            <Text style={styles.chatTeaserSubtitle}>Pode me contar qualquer coisa, meu amor.</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );

  const renderChat = () => (
    <KeyboardAvoidingView style={styles.chatScreen} behavior="padding" keyboardVerticalOffset={0}>
      <View style={[styles.chatHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.chatHeaderAvatar}><MaterialCommunityIcons name="spider-web" size={22} color={colors.primary} /></View>
        <View style={styles.chatHeaderCopy}>
          <Text style={styles.chatHeaderTitle}>Conversando com o Miranha</Text>
          <View style={styles.chatOnlineRow}><View style={styles.chatOnlineDot} /><Text style={styles.chatOnlineText}>sempre por perto</Text></View>
        </View>
        <Pressable style={styles.headerIconButton} onPress={() => setIsSummonOpen(true)} testID="chat-summon-button">
          <Ionicons name="call-outline" size={21} color={colors.pinkSoft} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.starterRow}>
        {[
          { label: 'Estou com fome', value: 'Estou com fome' },
          { label: 'Meu vale-beijos', value: 'Quero meu vale-beijos' },
          { label: 'Preciso de carinho', value: 'Preciso de carinho' },
          { label: 'Tenho uma conquista', value: 'Tenho uma conquista' },
        ].map((starter) => (
          <Pressable key={starter.value} style={styles.starterChip} onPress={() => setDraft(starter.value)} testID={`starter-${starter.value}`}>
            <Text style={styles.starterChipText}>{starter.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <FlatList
        inverted
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageRow, item.from === 'her' ? styles.messageRowHer : styles.messageRowMiranha]}>
            {item.from === 'miranha' && <View style={styles.messageMiniAvatar}><Text style={styles.messageMiniAvatarText}>M</Text></View>}
            <View style={[styles.messageBubble, item.from === 'her' ? styles.messageBubbleHer : styles.messageBubbleMiranha]}>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={[styles.messageTime, item.from === 'her' && styles.messageTimeHer]}>{item.time}</Text>
            </View>
          </View>
        )}
        ListHeaderComponent={
          isTyping ? (
            <View style={styles.typingRow}>
              <View style={styles.messageMiniAvatar}><Text style={styles.messageMiniAvatarText}>M</Text></View>
              <View style={styles.typingBubble}><View style={styles.typingDot} /><View style={styles.typingDot} /><View style={styles.typingDot} /></View>
            </View>
          ) : null
        }
        contentContainerStyle={styles.messageList}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      <View style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {showCallPrompt && (
          <View style={styles.callPrompt}>
            <View style={styles.callPromptCopy}>
              <Text style={styles.callPromptTitle}>Quer ligar para ele agora?</Text>
              <Text style={styles.callPromptSubtitle}>Seu Miranha está com os braços abertos para você.</Text>
            </View>
            <Pressable style={styles.callPromptButton} onPress={() => { setShowCallPrompt(false); callMiranha(); }} testID="sad-call-button">
              <Ionicons name="call" size={17} color={colors.primaryForeground} />
            </Pressable>
          </View>
        )}
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Fala comigo, meu amor..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={500}
            style={styles.composerInput}
            onSubmitEditing={handleSend}
            testID="chat-input"
          />
          <Pressable
            onPress={handleSend}
            style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
            disabled={!draft.trim() || isTyping}
            testID="send-message-button"
          >
            <Ionicons name="arrow-up" size={21} color={colors.primaryForeground} />
          </Pressable>
        </View>
        <Text style={styles.composerHint}>Seu espaço é seguro • respostas locais e carinhosas</Text>
      </View>
    </KeyboardAvoidingView>
  );

  const renderLove = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 112 }]}
    >
      <ScreenTitle eyebrow="CENTRAL DO AMOR" title="Coisas que guardo por você" subtitle="Pequenas palavras para lembrar o quanto você é especial." styles={styles} />

      <View style={styles.loveDeclarationCard}>
        <View style={styles.loveCardTop}><Text style={styles.loveCardLabel}>DECLARAÇÃO Nº {String(declarationIndex + 1).padStart(2, '0')}</Text><Text style={styles.loveCardHeart}>♥</Text></View>
        <Text style={styles.declarationText}>{declarations[declarationIndex]}</Text>
        <Pressable
          style={styles.outlineAction}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDeclarationIndex((current) => (current + 1) % declarations.length);
          }}
          testID="new-declaration-button"
        >
          <Ionicons name="shuffle-outline" size={17} color={colors.pinkSoft} />
          <Text style={styles.outlineActionText}>Outra declaração</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeading}><View><Text style={styles.sectionEyebrow}>365 DIAS DE CARINHO</Text><Text style={styles.sectionTitle}>Palavra para hoje</Text></View><Text style={styles.sectionHint}>uma por dia</Text></View>
      <Pressable style={styles.dailyCard} onPress={() => setDailyPhraseIndex((current) => (current + 1) % dailyPhrases.length)} testID="daily-phrase-card">
        <View style={styles.dailyTop}><View style={styles.dailyBadge}><Ionicons name="sunny-outline" size={14} color={colors.gold} /><Text style={styles.dailyBadgeText}>DIA {String(dailyPhraseIndex + 1).padStart(3, '0')} DE 365</Text></View><Text style={styles.dailyHeart}>♥</Text></View>
        <Text style={styles.dailyPhrase}>{dailyPhrases[dailyPhraseIndex]}</Text>
        <View style={styles.dailyDivider} />
        <Text style={styles.dailyHint}>Amanhã tem uma nova para você • toque para ver outra</Text>
      </Pressable>

      <View style={styles.sectionHeading}><View><Text style={styles.sectionEyebrow}>FÉ & ACOLHIMENTO</Text><Text style={styles.sectionTitle}>Versículo de apoio</Text></View></View>
      <Pressable style={styles.verseCard} onPress={() => setVerseIndex((current) => (current + 1) % verses.length)} testID="verse-card">
        <View style={styles.verseTop}><View style={styles.verseBadge}><Text style={styles.verseBadgeText}>{verses[verseIndex].topic}</Text></View><Text style={styles.verseReference}>{verses[verseIndex].reference}</Text></View>
        <Text style={styles.verseText}>“{verses[verseIndex].verse}”</Text>
        <View style={styles.verseDivider} />
        <Text style={styles.verseNote}>{verses[verseIndex].note}</Text>
        <Text style={styles.tapHint}>toque para outra palavra</Text>
      </Pressable>

      <View style={styles.princeCard}>
        <View style={styles.princeRose}><Text style={styles.princeRoseText}>✿</Text></View>
        <Text style={styles.sectionEyebrow}>UM LEMBRETE PARA VOCÊ</Text>
        <Text style={styles.princeTitle}>🌹 Pequeno Príncipe</Text>
        <Text style={styles.princeText}>“Algumas pessoas se tornam especiais não porque são perfeitas, mas porque nosso coração aprendeu a cuidar delas.”</Text>
        <Text style={styles.princeNote}>E eu escolho cuidar de você todos os dias, minha princesa.</Text>
      </View>

      <View style={styles.sectionHeading}><View><Text style={styles.sectionEyebrow}>MEMÓRIAS VIVAS</Text><Text style={styles.sectionTitle}>Nossa história</Text></View><Text style={styles.sectionHint}>toque e edite</Text></View>
      <View style={styles.storyList}>
        {story.map((moment) => (
          <View style={styles.storyItem} key={moment.id}>
            <View style={styles.storyDot}><Text style={styles.storyDotText}>♥</Text></View>
            <View style={styles.storyFields}>
              <TextInput value={moment.title} onChangeText={(value) => updateStory(moment.id, 'title', value)} style={styles.storyTitleInput} placeholderTextColor={colors.mutedForeground} />
              <TextInput value={moment.body} onChangeText={(value) => updateStory(moment.id, 'body', value)} style={styles.storyBodyInput} placeholderTextColor={colors.mutedForeground} multiline />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderMiranha = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 112 }]}
    >
      <View style={styles.profileHero}>
        <View style={styles.profileOrb}><MaterialCommunityIcons name="spider-web" size={48} color={colors.pinkSoft} /></View>
        <Text style={styles.profileTitle}>Seu Miranha</Text>
        <Text style={styles.profileSubtitle}>protetor oficial do seu coração</Text>
        <View style={styles.profileStatus}><View style={styles.chatOnlineDot} /><Text style={styles.profileStatusText}>disponível para você</Text></View>
      </View>
      <View style={styles.promiseCard}>
        <Text style={styles.promiseQuote}>“</Text>
        <Text style={styles.promiseText}>{miranhaPromise}</Text>
        <Text style={styles.promiseSign}>-meu miranha</Text>
      </View>
      <Pressable style={styles.contactCard} onPress={() => setIsSummonOpen(true)} testID="contact-card">
        <View style={[styles.contactIcon, { backgroundColor: colors.primary }]}><MaterialCommunityIcons name="spider-thread" size={23} color={colors.primaryForeground} /></View>
        <View style={styles.contactCopy}><Text style={styles.contactTitle}>Chamado Aranha</Text><Text style={styles.contactSubtitle}>WhatsApp ou ligação, você escolhe.</Text></View>
        <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
      </Pressable>
      <View style={styles.safeNote}><Ionicons name="lock-closed-outline" size={15} color={colors.mutedForeground} /><Text style={styles.safeNoteText}>Este cantinho é salvo no seu dispositivo.</Text></View>
    </ScrollView>
  );

  const renderAdmin = () => {
    if (!isAdminUnlocked) {
      return (
        <KeyboardAvoidingView style={styles.adminScreen} behavior="padding">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, styles.adminLockContent, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 112 }]}
          >
            <View style={styles.adminLockCard}>
              <View style={styles.adminLockIcon}><Feather name="shield" size={25} color={colors.pinkSoft} /></View>
              <Text style={styles.adminEyebrow}>ÁREA RESTRITA</Text>
              <Text style={styles.adminLockTitle}>Administrador</Text>
              <Text style={styles.adminLockSubtitle}>Entre para cuidar dos textos, flores e configurações do seu cantinho.</Text>
              <TextInput
                value={adminPassword}
                onChangeText={setAdminPassword}
                placeholder="Digite a senha"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={6}
                style={styles.adminInput}
                onSubmitEditing={handleAdminLogin}
                testID="admin-password-input"
              />
              <Pressable style={styles.adminPrimaryButton} onPress={handleAdminLogin} testID="admin-login-button">
                <Feather name="unlock" size={17} color={colors.primaryForeground} />
                <Text style={styles.adminPrimaryText}>Entrar no administrador</Text>
              </Pressable>
              <Text style={styles.adminLocalNote}>Acesso protegido localmente neste dispositivo.</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    return (
      <KeyboardAvoidingView style={styles.adminScreen} behavior="padding">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 112 }]}
        >
          <View style={styles.adminHeader}>
            <View>
              <Text style={styles.adminEyebrow}>PAINEL LOCAL</Text>
              <Text style={styles.adminTitle}>Administrador</Text>
              <Text style={styles.adminSubtitle}>Tudo do seu Miranha em um só lugar.</Text>
            </View>
            <Pressable style={styles.adminLogoutButton} onPress={handleAdminLogout} testID="admin-logout-button">
              <Feather name="log-out" size={17} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={styles.adminStats}>
            <View style={styles.adminStatCard}><Text style={styles.adminStatNumber}>{flowerCount}</Text><Text style={styles.adminStatLabel}>flores recebidas</Text></View>
            <View style={styles.adminStatCard}><Text style={styles.adminStatNumber}>{declarations.length}</Text><Text style={styles.adminStatLabel}>declarações</Text></View>
          </View>

          <View style={styles.adminSection}>
            <Text style={styles.adminSectionEyebrow}>TEXTOS</Text>
            <Text style={styles.adminSectionTitle}>Mensagem da aba Miranha</Text>
            <Text style={styles.adminSectionHint}>Edite a promessa que aparece no cartão do seu Miranha.</Text>
            <TextInput
              value={adminPromiseDraft}
              onChangeText={setAdminPromiseDraft}
              multiline
              textAlignVertical="top"
              style={[styles.adminInput, styles.adminTextArea]}
              placeholder="Escreva a mensagem..."
              placeholderTextColor={colors.mutedForeground}
              testID="admin-promise-input"
            />
            <Pressable style={styles.adminSecondaryButton} onPress={saveAdminPromise} testID="admin-save-promise-button">
              <Feather name="save" size={16} color={colors.pinkSoft} />
              <Text style={styles.adminSecondaryText}>Salvar mensagem</Text>
            </Pressable>
          </View>

          <View style={styles.adminSection}>
            <Text style={styles.adminSectionEyebrow}>DECLARAÇÕES</Text>
            <Text style={styles.adminSectionTitle}>Declarações de amor</Text>
            <Text style={styles.adminSectionHint}>Adicione, edite ou remova as mensagens da aba Amor.</Text>
            {declarations.map((declaration, index) => (
              <View key={`${index}-${declaration.slice(0, 12)}`} style={styles.adminDeclarationRow}>
                <View style={styles.adminDeclarationIndex}><Text style={styles.adminDeclarationIndexText}>{String(index + 1).padStart(2, '0')}</Text></View>
                <Text style={styles.adminDeclarationText} numberOfLines={3}>{declaration}</Text>
                <View style={styles.adminDeclarationActions}>
                  <Pressable style={styles.adminIconButton} onPress={() => startEditingDeclaration(index)} testID={`admin-edit-declaration-${index}`}><Feather name="edit-2" size={15} color={colors.pinkSoft} /></Pressable>
                  <Pressable style={styles.adminIconButton} onPress={() => removeDeclaration(index)} testID={`admin-delete-declaration-${index}`}><Feather name="trash-2" size={15} color={colors.redGlow} /></Pressable>
                </View>
              </View>
            ))}
            {adminEditingDeclarationIndex !== null && (
              <View style={styles.adminEditBox}>
                <Text style={styles.adminFieldLabel}>Editando declaração {adminEditingDeclarationIndex + 1}</Text>
                <TextInput
                  value={adminDeclarationDraft}
                  onChangeText={setAdminDeclarationDraft}
                  multiline
                  textAlignVertical="top"
                  style={[styles.adminInput, styles.adminTextArea]}
                  placeholderTextColor={colors.mutedForeground}
                  testID="admin-edit-declaration-input"
                />
                <View style={styles.adminButtonRow}>
                  <Pressable style={styles.adminCancelButton} onPress={cancelEditingDeclaration}><Text style={styles.adminCancelText}>Cancelar</Text></Pressable>
                  <Pressable style={styles.adminSecondaryButton} onPress={saveEditedDeclaration} testID="admin-save-declaration-button"><Feather name="check" size={16} color={colors.pinkSoft} /><Text style={styles.adminSecondaryText}>Salvar edição</Text></Pressable>
                </View>
              </View>
            )}
            <Text style={styles.adminFieldLabel}>Nova declaração</Text>
            <TextInput
              value={adminEditingDeclarationIndex === null ? adminDeclarationDraft : ''}
              onChangeText={(value) => { if (adminEditingDeclarationIndex === null) setAdminDeclarationDraft(value); }}
              multiline
              textAlignVertical="top"
              style={[styles.adminInput, styles.adminTextArea]}
              placeholder="Escreva uma nova declaração de amor..."
              placeholderTextColor={colors.mutedForeground}
              editable={adminEditingDeclarationIndex === null}
              testID="admin-new-declaration-input"
            />
            {adminEditingDeclarationIndex === null && <Pressable style={styles.adminSecondaryButton} onPress={addDeclaration} testID="admin-add-declaration-button"><Feather name="plus" size={16} color={colors.pinkSoft} /><Text style={styles.adminSecondaryText}>Adicionar declaração</Text></Pressable>}
          </View>

          <View style={styles.adminSection}>
            <Text style={styles.adminSectionEyebrow}>CONTROLES</Text>
            <Text style={styles.adminSectionTitle}>Ferramentas do aplicativo</Text>
            <Pressable style={styles.adminActionRow} onPress={resetFlowers} testID="admin-reset-flowers-button">
              <View style={[styles.adminActionIcon, { backgroundColor: `${colors.gold}1A` }]}><Ionicons name="flower-outline" size={19} color={colors.gold} /></View>
              <View style={styles.adminActionCopy}><Text style={styles.adminActionTitle}>Zerar flores recebidas</Text><Text style={styles.adminActionSubtitle}>A contagem atual é {flowerCount}.</Text></View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
            <Pressable style={styles.adminActionRow} onPress={clearChat} testID="admin-clear-chat-button">
              <View style={[styles.adminActionIcon, { backgroundColor: `${colors.blue}1A` }]}><Ionicons name="chatbubbles-outline" size={19} color={colors.blue} /></View>
              <View style={styles.adminActionCopy}><Text style={styles.adminActionTitle}>Limpar histórico do chat</Text><Text style={styles.adminActionSubtitle}>Voltar para a conversa inicial.</Text></View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
            <Pressable style={styles.adminActionRow} onPress={restoreDefaults} testID="admin-restore-defaults-button">
              <View style={[styles.adminActionIcon, { backgroundColor: `${colors.redGlow}1A` }]}><Feather name="rotate-ccw" size={19} color={colors.redGlow} /></View>
              <View style={styles.adminActionCopy}><Text style={styles.adminActionTitle}>Restaurar textos padrão</Text><Text style={styles.adminActionSubtitle}>Desfazer as personalizações de textos.</Text></View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={styles.adminSecurityNote}>As alterações deste painel ficam salvas apenas neste dispositivo.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const content = activeTab === 'home' ? renderHome() : activeTab === 'ia' ? renderChat() : activeTab === 'love' ? renderLove() : activeTab === 'miranha' ? renderMiranha() : renderAdmin();

  return (
    <View style={styles.app}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.ambientGlowOne} />
      <View style={styles.ambientGlowTwo} />
      {content}
      <BottomNav activeTab={activeTab} onChange={goTo} styles={styles} colors={colors} bottomInset={insets.bottom} />
      <QuickActionModal
        action={activeQuickAction}
        onClose={() => setActiveQuickAction(null)}
        onChat={() => { setActiveQuickAction(null); goTo('ia'); }}
        onCall={() => { setActiveQuickAction(null); callMiranha(); }}
        onQuietDuration={(minutes) => { setActiveQuickAction(null); openWhatsApp(getQuietStatusMessage(minutes)); }}
        declaration={declarations[declarationIndex]}
        dailyPhrase={dailyPhrases[dailyPhraseIndex]}
        dailyIndex={dailyPhraseIndex}
        onNextDaily={() => setDailyPhraseIndex((current) => (current + 1) % dailyPhrases.length)}
        verse={verses[verseIndex]}
        styles={styles}
        colors={colors}
      />
      <SummonModal visible={isSummonOpen} onClose={() => setIsSummonOpen(false)} onMessage={openWhatsApp} onCall={callMiranha} styles={styles} colors={colors} />
    </View>
  );
}

function QuickCard({ icon, label, accent, onPress, styles, colors }: { icon: keyof typeof Feather.glyphMap; label: string; accent: string; onPress: () => void; styles: ReturnType<typeof createStyles>; colors: ReturnType<typeof useColors> }) {
  const accentColor = accent === 'violet' ? colors.violetSoft : accent === 'blue' ? colors.blue : accent === 'gold' ? colors.gold : accent === 'green' ? colors.green : colors.pinkSoft;
  return (
    <Pressable style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: `${accentColor}1A` }]}><Feather name={icon} size={20} color={accentColor} /></View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Feather name="arrow-up-right" size={15} color={colors.mutedForeground} style={styles.quickArrow} />
    </Pressable>
  );
}

function ScreenTitle({ eyebrow, title, subtitle, styles }: { eyebrow: string; title: string; subtitle: string; styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.screenTitle}><Text style={styles.sectionEyebrow}>{eyebrow}</Text><Text style={styles.screenTitleText}>{title}</Text><Text style={styles.screenSubtitle}>{subtitle}</Text></View>;
}

function BottomNav({ activeTab, onChange, styles, colors, bottomInset }: { activeTab: TabKey; onChange: (tab: TabKey) => void; styles: ReturnType<typeof createStyles>; colors: ReturnType<typeof useColors>; bottomInset: number }) {
  const items: { key: TabKey; icon: keyof typeof Feather.glyphMap; label: string }[] = [
    { key: 'home', icon: 'home', label: 'Início' },
    { key: 'ia', icon: 'message-circle', label: 'IA' },
    { key: 'love', icon: 'heart', label: 'Amor' },
    { key: 'miranha', icon: 'aperture', label: 'Miranha' },
    { key: 'admin', icon: 'settings', label: 'Admin' },
  ];
  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(bottomInset, 9) }]}>
      {items.map((item) => {
        const active = activeTab === item.key;
        return (
          <Pressable key={item.key} style={styles.navItem} onPress={() => onChange(item.key)} testID={`nav-${item.key}`}>
            <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}><Feather name={item.icon} size={20} color={active ? colors.primary : colors.mutedForeground} /></View>
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function QuickActionModal({ action, onClose, onChat, onCall, onQuietDuration, declaration, dailyPhrase, dailyIndex, onNextDaily, verse, styles, colors }: { action: QuickAction | null; onClose: () => void; onChat: () => void; onCall: () => void; onQuietDuration: (minutes: number) => void; declaration: string; dailyPhrase: string; dailyIndex: number; onNextDaily: () => void; verse: (typeof verses)[number]; styles: ReturnType<typeof createStyles>; colors: ReturnType<typeof useColors> }) {
  if (!action) return null;
  const isLove = action === 'love';
  const isSpecial = action === 'special';
  const isDaily = action === 'daily';
  const isVerse = action === 'verse';
  const isSad = action === 'sad';
  const isAngry = action === 'angry';
  const content = isLove ? declaration : isSpecial ? specialMessage : isDaily ? `DIA ${String(dailyIndex + 1).padStart(3, '0')} DE 365\n\n${dailyPhrase}` : isVerse ? `“${verse.verse}”\n\n${verse.note}` : isAngry ? 'Você pode escolher um tempo para ficar quietinha. Eu vou respeitar seu espaço, sem pressão e sem cobranças. Quando escolher, o WhatsApp abrirá com um aviso simples para eu saber que está tudo certo.' : action === 'motivation' ? responseBank.motivação[0] : action === 'tired' ? responseBank.cansada[0] : responseBank.triste[0];
  const title = isLove ? 'Por que eu te amo?' : isSpecial ? 'Uma mensagem especial' : isDaily ? 'Uma palavra para hoje' : isVerse ? `${verse.topic} para hoje` : isAngry ? 'Um tempo para você' : action === 'motivation' ? 'Um empurrinho do seu Miranha' : action === 'tired' ? 'Vem descansar comigo' : 'Eu estou aqui com você';
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.smallModal}>
          <View style={styles.modalHandle} />
          <View style={styles.modalIcon}><Ionicons name={isVerse ? 'book-outline' : isDaily ? 'sunny-outline' : isAngry ? 'warning-outline' : 'heart'} size={24} color={isAngry ? colors.redGlow : colors.pinkSoft} /></View>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalBody}>{content}</Text>
          </ScrollView>
          <View style={styles.modalActions}>
            {isSad && <Pressable style={styles.modalCallOption} onPress={onCall} testID="sad-modal-call-button"><Ionicons name="call" size={17} color={colors.primaryForeground} /><Text style={styles.modalCallOptionText}>Quer ligar para ele agora?</Text></Pressable>}
            {isDaily && <Pressable style={styles.modalSecondary} onPress={onNextDaily}><Text style={styles.modalSecondaryText}>Outra frase para hoje</Text></Pressable>}
            {isAngry && <View style={styles.quietPicker}><Text style={styles.quietPickerLabel}>Por quanto tempo você quer ficar quietinha?</Text><View style={styles.quietOptions}>{QUIET_DURATIONS.map((duration) => <Pressable key={duration} style={styles.quietOption} onPress={() => onQuietDuration(duration)}><Text style={styles.quietOptionText}>{formatQuietDuration(duration)}</Text></Pressable>)}</View></View>}
            <Pressable style={styles.modalSecondary} onPress={onClose}><Text style={styles.modalSecondaryText}>Guardar no coração</Text></Pressable>
            {!isAngry && <Pressable style={styles.modalPrimary} onPress={onChat}><Text style={styles.modalPrimaryText}>Falar com ele</Text><Feather name="arrow-up-right" size={17} color={colors.primaryForeground} /></Pressable>}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SummonModal({ visible, onClose, onMessage, onCall, styles, colors }: { visible: boolean; onClose: () => void; onMessage: () => void; onCall: () => void; styles: ReturnType<typeof createStyles>; colors: ReturnType<typeof useColors> }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.summonModal}>
          <View style={styles.modalHandle} />
          <View style={styles.webModal}><MaterialCommunityIcons name="spider-web" size={43} color={colors.pinkSoft} /><View style={styles.webModalRing} /></View>
          <Text style={styles.summonModalKicker}>CHAMADO ARANHA RECEBIDO!</Text>
          <Text style={styles.modalTitle}>Seu Miranha está disponível.</Text>
          <Text style={styles.modalBodyCenter}>Como você quer falar com ele, meu amor?</Text>
          <Pressable style={styles.contactOption} onPress={onMessage} testID="whatsapp-option">
            <View style={[styles.optionIcon, { backgroundColor: colors.whatsapp }]}><Ionicons name="logo-whatsapp" size={25} color={colors.white} /></View>
            <View style={styles.optionCopy}><Text style={styles.optionTitle}>MENSAGEM</Text><Text style={styles.optionSubtitle}>Quero conversar com meu Miranha</Text></View><Feather name="arrow-up-right" size={19} color={colors.mutedForeground} />
          </Pressable>
          <Pressable style={styles.contactOption} onPress={onCall} testID="call-option">
            <View style={[styles.optionIcon, { backgroundColor: colors.primary }]}><Ionicons name="call" size={23} color={colors.primaryForeground} /></View>
            <View style={styles.optionCopy}><Text style={styles.optionTitle}>LIGAÇÃO</Text><Text style={styles.optionSubtitle}>Preciso ouvir sua voz</Text></View><Feather name="arrow-up-right" size={19} color={colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={onClose} style={styles.closeModal}><Text style={styles.closeModalText}>Agora não</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ReturnType<typeof useColors>, width: number) {
  return StyleSheet.create({
    app: { flex: 1, backgroundColor: colors.background },
    ambientGlowOne: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: colors.accent, opacity: 0.1, top: -100, right: -100 },
    ambientGlowTwo: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: colors.primary, opacity: 0.06, bottom: 130, left: -120 },
    scrollContent: { paddingHorizontal: 18 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    eyebrow: { color: colors.mutedForeground, fontSize: 10, letterSpacing: 2.2, fontWeight: '700' },
    brand: { color: colors.foreground, fontSize: 21, fontWeight: '700', marginTop: 5, letterSpacing: -0.5 },
    brandHeart: { color: colors.primary },
    avatarButton: { width: 43, height: 43, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: colors.pinkSoft, fontSize: 17, fontWeight: '700' },
    onlineDot: { position: 'absolute', right: 0, bottom: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green, borderWidth: 2, borderColor: colors.background },
    heroWrap: { backgroundColor: colors.surface, borderRadius: 30, overflow: 'hidden', minHeight: 368, padding: 25, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 29 },
    heroOrb: { position: 'absolute', width: 290, height: 290, borderRadius: 145, backgroundColor: colors.primary, opacity: 0.07, top: -110, right: -95 },
    webDecor: { position: 'absolute', width: 170, height: 170, right: -12, top: 10, opacity: 0.4 },
    radarSweep: { position: 'absolute', width: 170, height: 170, left: 0, top: 0 },
    radarSweepLine: { position: 'absolute', width: 2, height: 78, left: 84, top: 7, backgroundColor: colors.primary, opacity: 0.9, shadowColor: colors.primary, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
    radarPing: { position: 'absolute', width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: colors.primary, left: 78.5, top: 78.5, shadowColor: colors.primary, shadowOpacity: 0.85, shadowRadius: 9, shadowOffset: { width: 0, height: 0 } },
    radarCenter: { position: 'absolute', width: 18, height: 18, borderRadius: 9, left: 76, top: 76, backgroundColor: `${colors.background}CC`, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    radarCenterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 1, shadowRadius: 7, shadowOffset: { width: 0, height: 0 } },
    webLine: { position: 'absolute', width: 1, height: 210, backgroundColor: colors.pinkSoft, left: 83, top: -20, transform: [{ rotate: '45deg' }] },
    webLineOne: { transform: [{ rotate: '0deg' }] },
    webLineTwo: { transform: [{ rotate: '90deg' }] },
    webLineThree: { transform: [{ rotate: '135deg' }] },
    webArc: { position: 'absolute', width: 105, height: 105, borderRadius: 53, borderWidth: 1, borderColor: colors.pinkSoft, left: 31, top: 32 },
    webArcOne: { width: 68, height: 68, borderRadius: 34, left: 50, top: 50 },
    webArcTwo: { width: 145, height: 145, borderRadius: 73, left: 12, top: 12 },
    floatingHeart: { position: 'absolute', right: 70, bottom: 55, zIndex: 2 },
    floatingHeartText: { color: colors.primary, fontSize: 18 },
    heroKicker: { color: colors.pinkSoft, fontSize: 10, letterSpacing: 1.8, fontWeight: '700', marginBottom: 14 },
    heroTitle: { color: colors.foreground, fontSize: width < 380 ? 34 : 39, fontWeight: '700', letterSpacing: -1.4 },
    heroTitleAccent: { color: colors.primary },
    heroSubtitle: { color: colors.foreground, fontSize: 20, fontWeight: '500', marginTop: 5 },
    heroBody: { color: colors.mutedForeground, fontSize: 14, lineHeight: 22, marginTop: 14, maxWidth: 255 },
    heroSpider: { position: 'absolute', right: 39, bottom: 35, color: colors.pinkSoft, fontSize: 35, opacity: 0.9 },
    summonButton: { borderRadius: 18, marginTop: 24, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
    summonGradient: { borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center' },
    summonIconCircle: { width: 43, height: 43, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center' },
    summonCopy: { flex: 1, marginLeft: 11 },
    summonTitle: { color: colors.primaryForeground, fontSize: 12, fontWeight: '800', letterSpacing: 0.7 },
    summonSubtitle: { color: colors.primaryForeground, opacity: 0.8, fontSize: 11, marginTop: 3 },
    sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
    sectionEyebrow: { color: colors.primary, fontSize: 10, letterSpacing: 1.8, fontWeight: '800', marginBottom: 6 },
    sectionTitle: { color: colors.foreground, fontSize: 19, fontWeight: '700', letterSpacing: -0.4 },
    sectionHint: { color: colors.mutedForeground, fontSize: 10, marginBottom: 2 },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginBottom: 18 },
    quickCard: { width: '48.3%', minHeight: 112, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, justifyContent: 'space-between' },
    pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
    quickIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    quickLabel: { color: colors.cardForeground, fontSize: 13, fontWeight: '600', lineHeight: 17, maxWidth: 125, marginTop: 9 },
    quickArrow: { position: 'absolute', bottom: 13, right: 13 },
    flowerCard: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: `${colors.primary}55`, marginBottom: 18, shadowColor: colors.primary, shadowOpacity: 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
    flowerCardGradient: { minHeight: 148, padding: 18, flexDirection: 'row', alignItems: 'center', position: 'relative', overflow: 'hidden' },
    flowerCopy: { flex: 1 },
    flowerEyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    flowerEyebrow: { color: colors.pinkSoft, fontSize: 10, letterSpacing: 1.8, fontWeight: '800' },
    flowerTinyHeart: { color: colors.primary, fontSize: 13 },
    flowerTitle: { color: colors.foreground, fontSize: 18, fontWeight: '700', marginTop: 8 },
    flowerCountRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6 },
    flowerCount: { color: colors.foreground, fontSize: 31, lineHeight: 35, fontWeight: '800' },
    flowerCountLabel: { color: colors.pinkSoft, fontSize: 13, fontWeight: '700', marginLeft: 6 },
    flowerHint: { color: colors.mutedForeground, fontSize: 10, marginTop: 5 },
    flowerButton: { width: 78, height: 78, borderRadius: 26, backgroundColor: `${colors.primary}22`, borderWidth: 1, borderColor: `${colors.pinkSoft}55`, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] },
    flowerButtonIcon: { fontSize: 34, lineHeight: 39 },
    flowerButtonLabel: { color: colors.pinkSoft, fontSize: 9, fontWeight: '800', letterSpacing: 1.1, marginTop: 2 },
    flowerCelebration: { position: 'absolute', right: 61, top: 44, width: 58, height: 58, alignItems: 'center', justifyContent: 'center', zIndex: 4 },
    flowerCelebrationText: { fontSize: 41, lineHeight: 48 },
    flowerSparkleOne: { position: 'absolute', top: -4, right: 1, color: colors.gold, fontSize: 18 },
    flowerSparkleTwo: { position: 'absolute', bottom: 1, left: 2, color: colors.pinkSoft, fontSize: 15 },
    chatTeaser: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
    chatTeaserGradient: { padding: 15, flexDirection: 'row', alignItems: 'center' },
    chatTeaserIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.glassBright, justifyContent: 'center', alignItems: 'center' },
    chatTeaserCopy: { flex: 1, marginLeft: 12 },
    chatTeaserTitle: { color: colors.foreground, fontSize: 14, fontWeight: '700' },
    chatTeaserSubtitle: { color: colors.mutedForeground, fontSize: 11, marginTop: 4 },
    bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, minHeight: 70, paddingTop: 9, paddingHorizontal: 9, backgroundColor: colors.overlay, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-around' },
    navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 68 },
    navIconWrap: { width: 38, height: 27, justifyContent: 'center', alignItems: 'center', borderRadius: 13 },
    navIconWrapActive: { backgroundColor: `${colors.primary}1A` },
    navLabel: { color: colors.mutedForeground, fontSize: 10, marginTop: 4, fontWeight: '500' },
    navLabelActive: { color: colors.primary, fontWeight: '700' },
    chatScreen: { flex: 1 },
    chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background },
    chatHeaderAvatar: { width: 42, height: 42, borderRadius: 15, backgroundColor: `${colors.primary}1A`, alignItems: 'center', justifyContent: 'center' },
    chatHeaderCopy: { flex: 1, marginLeft: 11 },
    chatHeaderTitle: { color: colors.foreground, fontSize: 15, fontWeight: '700' },
    chatOnlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    chatOnlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green, marginRight: 5 },
    chatOnlineText: { color: colors.mutedForeground, fontSize: 11 },
    headerIconButton: { width: 39, height: 39, borderRadius: 20, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center' },
    starterRow: { paddingHorizontal: 15, paddingVertical: 10, gap: 8 },
    starterChip: { borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: 11, paddingVertical: 7 },
    starterChipText: { color: colors.pinkSoft, fontSize: 11, fontWeight: '600' },
    messageList: { paddingHorizontal: 15, paddingTop: 8, paddingBottom: 13 },
    messageRow: { flexDirection: 'row', marginVertical: 6, alignItems: 'flex-end' },
    messageRowHer: { justifyContent: 'flex-end' },
    messageRowMiranha: { justifyContent: 'flex-start' },
    messageMiniAvatar: { width: 25, height: 25, borderRadius: 13, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center', marginRight: 7 },
    messageMiniAvatarText: { color: colors.pinkSoft, fontSize: 10, fontWeight: '800' },
    messageBubble: { maxWidth: '80%', paddingHorizontal: 14, paddingTop: 11, paddingBottom: 8, borderRadius: 18 },
    messageBubbleMiranha: { backgroundColor: colors.surfaceStrong, borderBottomLeftRadius: 5 },
    messageBubbleHer: { backgroundColor: colors.primary, borderBottomRightRadius: 5 },
    messageText: { color: colors.foreground, fontSize: 14, lineHeight: 21 },
    messageTime: { color: colors.mutedForeground, fontSize: 9, marginTop: 7 },
    messageTimeHer: { color: colors.primaryForeground, opacity: 0.7, textAlign: 'right' },
    typingRow: { flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 7 },
    typingBubble: { height: 37, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.surfaceStrong, flexDirection: 'row', alignItems: 'center', gap: 4 },
    typingDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.pinkSoft },
    composerWrap: { paddingHorizontal: 14, paddingTop: 10, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
    callPrompt: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${colors.primary}12`, borderRadius: 15, borderWidth: 1, borderColor: `${colors.primary}45`, padding: 10, marginBottom: 9 },
    callPromptCopy: { flex: 1, marginLeft: 2 },
    callPromptTitle: { color: colors.foreground, fontSize: 12, fontWeight: '800' },
    callPromptSubtitle: { color: colors.mutedForeground, fontSize: 10, marginTop: 3 },
    callPromptButton: { width: 35, height: 35, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    composer: { minHeight: 50, maxHeight: 105, borderRadius: 18, backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border, paddingLeft: 14, paddingRight: 7, flexDirection: 'row', alignItems: 'center' },
    composerInput: { flex: 1, color: colors.foreground, fontSize: 14, lineHeight: 20, maxHeight: 84, paddingTop: Platform.OS === 'ios' ? 12 : 7, paddingBottom: Platform.OS === 'ios' ? 11 : 7 },
    sendButton: { width: 37, height: 37, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    sendButtonDisabled: { opacity: 0.45 },
    composerHint: { color: colors.mutedForeground, fontSize: 9, textAlign: 'center', marginTop: 7 },
    screenTitle: { marginBottom: 24 },
    screenTitleText: { color: colors.foreground, fontSize: 30, lineHeight: 35, fontWeight: '700', letterSpacing: -1 },
    screenSubtitle: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 300 },
    loveDeclarationCard: { backgroundColor: colors.surfaceStrong, borderRadius: 25, borderWidth: 1, borderColor: colors.border, padding: 21, marginBottom: 28, overflow: 'hidden' },
    loveCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    loveCardLabel: { color: colors.pinkSoft, fontSize: 10, letterSpacing: 1.7, fontWeight: '800' },
    loveCardHeart: { color: colors.primary, fontSize: 26 },
    declarationText: { color: colors.foreground, fontSize: 19, lineHeight: 28, fontWeight: '600', marginTop: 20, letterSpacing: -0.3 },
    outlineAction: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9, marginTop: 22 },
    outlineActionText: { color: colors.pinkSoft, fontSize: 12, fontWeight: '700', marginLeft: 7 },
    verseCard: { backgroundColor: colors.glass, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 19, marginBottom: 24 },
    dailyCard: { backgroundColor: colors.surfaceStrong, borderRadius: 22, borderWidth: 1, borderColor: `${colors.gold}45`, padding: 19, marginBottom: 28, shadowColor: colors.gold, shadowOpacity: 0.12, shadowRadius: 15, shadowOffset: { width: 0, height: 7 }, elevation: 3 },
    dailyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dailyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${colors.gold}14`, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6, gap: 6 },
    dailyBadgeText: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
    dailyHeart: { color: colors.primary, fontSize: 25 },
    dailyPhrase: { color: colors.foreground, fontSize: 17, lineHeight: 26, fontWeight: '600', marginTop: 19 },
    dailyDivider: { height: 1, backgroundColor: colors.border, marginVertical: 15 },
    dailyHint: { color: colors.mutedForeground, fontSize: 10, lineHeight: 15 },
    verseTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    verseBadge: { backgroundColor: `${colors.accent}2B`, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5 },
    verseBadgeText: { color: colors.violetSoft, fontSize: 10, fontWeight: '700' },
    verseReference: { color: colors.foreground, fontSize: 12, fontWeight: '700' },
    verseText: { color: colors.foreground, fontSize: 16, lineHeight: 25, fontWeight: '500', marginTop: 18 },
    verseDivider: { height: 1, backgroundColor: colors.border, marginVertical: 15 },
    verseNote: { color: colors.mutedForeground, fontSize: 12, lineHeight: 18 },
    tapHint: { color: colors.primary, fontSize: 10, marginTop: 15, fontWeight: '600' },
    princeCard: { backgroundColor: '#2b1a24', borderRadius: 23, padding: 20, marginBottom: 29, borderWidth: 1, borderColor: '#5a3346' },
    princeRose: { position: 'absolute', top: 14, right: 17 },
    princeRoseText: { color: colors.primary, fontSize: 35, opacity: 0.85 },
    princeTitle: { color: colors.foreground, fontSize: 20, fontWeight: '700', marginBottom: 13 },
    princeText: { color: colors.foreground, fontSize: 15, lineHeight: 23, fontWeight: '500', maxWidth: 290 },
    princeNote: { color: colors.pinkSoft, fontSize: 12, lineHeight: 18, marginTop: 16, fontStyle: 'italic' },
    storyList: { gap: 12 },
    storyItem: { flexDirection: 'row', padding: 14, borderRadius: 18, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border },
    storyDot: { width: 29, height: 29, borderRadius: 15, backgroundColor: `${colors.primary}1A`, alignItems: 'center', justifyContent: 'center', marginRight: 11, marginTop: 2 },
    storyDotText: { color: colors.primary, fontSize: 13 },
    storyFields: { flex: 1 },
    storyTitleInput: { color: colors.foreground, fontSize: 13, fontWeight: '700', padding: 0, marginBottom: 6 },
    storyBodyInput: { color: colors.mutedForeground, fontSize: 12, lineHeight: 18, padding: 0, minHeight: 20 },
    profileHero: { alignItems: 'center', paddingTop: 12, paddingBottom: 29 },
    profileOrb: { width: 106, height: 106, borderRadius: 53, backgroundColor: colors.surfaceStrong, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.25, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
    profileTitle: { color: colors.foreground, fontSize: 28, fontWeight: '700', marginTop: 16, letterSpacing: -0.8 },
    profileSubtitle: { color: colors.mutedForeground, fontSize: 13, marginTop: 5 },
    profileStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 13, backgroundColor: `${colors.green}12`, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
    profileStatusText: { color: colors.green, fontSize: 10, fontWeight: '700', marginLeft: 6 },
    promiseCard: { padding: 21, backgroundColor: colors.surfaceStrong, borderRadius: 23, borderWidth: 1, borderColor: colors.border, marginBottom: 15 },
    promiseQuote: { color: colors.primary, fontSize: 50, height: 34, lineHeight: 50, fontWeight: '700' },
    promiseText: { color: colors.foreground, fontSize: 16, lineHeight: 24, fontWeight: '500', marginTop: 9 },
    promiseSign: { color: colors.pinkSoft, fontSize: 12, marginTop: 15, fontStyle: 'italic', textAlign: 'right' },
    contactCard: { padding: 15, borderRadius: 20, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' },
    contactIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    contactCopy: { flex: 1, marginLeft: 12 },
    contactTitle: { color: colors.foreground, fontSize: 14, fontWeight: '700' },
    contactSubtitle: { color: colors.mutedForeground, fontSize: 11, marginTop: 4 },
    safeNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 22 },
    safeNoteText: { color: colors.mutedForeground, fontSize: 10, marginLeft: 6 },
    adminScreen: { flex: 1, backgroundColor: colors.background },
    adminLockContent: { flexGrow: 1, justifyContent: 'center' },
    adminLockCard: { backgroundColor: colors.surfaceStrong, borderRadius: 27, borderWidth: 1, borderColor: colors.border, padding: 23, alignItems: 'center' },
    adminLockIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: `${colors.primary}1A`, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
    adminEyebrow: { color: colors.primary, fontSize: 10, letterSpacing: 1.8, fontWeight: '800' },
    adminLockTitle: { color: colors.foreground, fontSize: 28, fontWeight: '700', marginTop: 8 },
    adminLockSubtitle: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 9, marginBottom: 21 },
    adminInput: { width: '100%', minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.input, color: colors.foreground, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
    adminTextArea: { minHeight: 105, lineHeight: 20, marginTop: 10 },
    adminPrimaryButton: { width: '100%', borderRadius: 15, backgroundColor: colors.primary, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 11 },
    adminPrimaryText: { color: colors.primaryForeground, fontSize: 13, fontWeight: '800' },
    adminLocalNote: { color: colors.mutedForeground, fontSize: 10, marginTop: 15 },
    adminHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 },
    adminTitle: { color: colors.foreground, fontSize: 30, lineHeight: 35, fontWeight: '700', letterSpacing: -1 },
    adminSubtitle: { color: colors.mutedForeground, fontSize: 13, marginTop: 6 },
    adminLogoutButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    adminStats: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    adminStatCard: { flex: 1, backgroundColor: colors.glass, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 14 },
    adminStatNumber: { color: colors.primary, fontSize: 25, fontWeight: '800' },
    adminStatLabel: { color: colors.mutedForeground, fontSize: 11, marginTop: 4 },
    adminSection: { backgroundColor: colors.surfaceStrong, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
    adminSectionEyebrow: { color: colors.pinkSoft, fontSize: 10, letterSpacing: 1.7, fontWeight: '800' },
    adminSectionTitle: { color: colors.foreground, fontSize: 18, fontWeight: '700', marginTop: 6 },
    adminSectionHint: { color: colors.mutedForeground, fontSize: 11, lineHeight: 17, marginTop: 5 },
    adminSecondaryButton: { alignSelf: 'flex-start', borderRadius: 13, borderWidth: 1, borderColor: `${colors.primary}55`, backgroundColor: `${colors.primary}12`, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
    adminSecondaryText: { color: colors.pinkSoft, fontSize: 11, fontWeight: '800' },
    adminDeclarationRow: { flexDirection: 'row', alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12, marginTop: 12 },
    adminDeclarationIndex: { width: 29, height: 29, borderRadius: 10, backgroundColor: `${colors.primary}1A`, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
    adminDeclarationIndexText: { color: colors.pinkSoft, fontSize: 10, fontWeight: '800' },
    adminDeclarationText: { flex: 1, color: colors.mutedForeground, fontSize: 11, lineHeight: 17, paddingRight: 8 },
    adminDeclarationActions: { flexDirection: 'row', gap: 5 },
    adminIconButton: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
    adminEditBox: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 2 },
    adminFieldLabel: { color: colors.foreground, fontSize: 11, fontWeight: '700', marginTop: 12 },
    adminButtonRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    adminCancelButton: { paddingHorizontal: 10, paddingVertical: 10 },
    adminCancelText: { color: colors.mutedForeground, fontSize: 11, fontWeight: '700' },
    adminActionRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12, marginTop: 5 },
    adminActionIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    adminActionCopy: { flex: 1 },
    adminActionTitle: { color: colors.foreground, fontSize: 12, fontWeight: '700' },
    adminActionSubtitle: { color: colors.mutedForeground, fontSize: 10, marginTop: 3 },
    adminSecurityNote: { color: colors.mutedForeground, fontSize: 10, lineHeight: 15, textAlign: 'center', marginVertical: 4 },
    modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    smallModal: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 23, paddingBottom: 31, borderWidth: 1, borderColor: colors.border },
    summonModal: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 23, paddingBottom: 24, borderWidth: 1, borderColor: colors.border },
    modalHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 20 },
    modalIcon: { width: 52, height: 52, borderRadius: 19, backgroundColor: `${colors.primary}1A`, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 13 },
    modalTitle: { color: colors.foreground, fontSize: 23, lineHeight: 28, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5 },
    modalScroll: { maxHeight: 410 },
    modalBody: { color: colors.mutedForeground, fontSize: 14, lineHeight: 21, marginTop: 15 },
    modalBodyCenter: { color: colors.mutedForeground, fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 18 },
    modalActions: { gap: 9, marginTop: 22 },
    quietPicker: { marginTop: 4 },
    quietPickerLabel: { color: colors.foreground, fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
    quietOptions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
    quietOption: { width: '48%', borderRadius: 13, borderWidth: 1, borderColor: `${colors.primary}55`, backgroundColor: `${colors.primary}12`, paddingVertical: 12, alignItems: 'center' },
    quietOptionText: { color: colors.pinkSoft, fontSize: 12, fontWeight: '800' },
    modalCallOption: { backgroundColor: colors.primary, borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    modalCallOptionText: { color: colors.primaryForeground, fontSize: 12, fontWeight: '800' },
    modalSecondary: { alignItems: 'center', paddingVertical: 12 },
    modalSecondaryText: { color: colors.mutedForeground, fontSize: 12, fontWeight: '600' },
    modalPrimary: { backgroundColor: colors.primary, borderRadius: 15, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    modalPrimaryText: { color: colors.primaryForeground, fontSize: 13, fontWeight: '800' },
    webModal: { height: 78, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    webModalRing: { position: 'absolute', width: 76, height: 76, borderRadius: 38, borderWidth: 1, borderColor: colors.primary, opacity: 0.35 },
    summonModalKicker: { color: colors.primary, fontSize: 11, letterSpacing: 1.8, fontWeight: '800', textAlign: 'center', marginTop: 5 },
    contactOption: { borderRadius: 17, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    optionIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    optionCopy: { flex: 1, marginLeft: 11 },
    optionTitle: { color: colors.foreground, fontSize: 11, letterSpacing: 1.2, fontWeight: '800' },
    optionSubtitle: { color: colors.mutedForeground, fontSize: 12, marginTop: 4 },
    closeModal: { alignItems: 'center', paddingTop: 7, paddingBottom: 3 },
    closeModalText: { color: colors.mutedForeground, fontSize: 12, fontWeight: '600' },
  });
}