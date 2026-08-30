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

type TabKey = 'home' | 'ia' | 'love' | 'miranha';
type QuickAction = 'love' | 'tired' | 'sad' | 'motivation' | 'verse' | 'special' | 'chat';
type Message = {
  id: string;
  text: string;
  from: 'miranha' | 'her';
  time: string;
};

const STORAGE_KEYS = {
  messages: '@miranha/messages',
  story: '@miranha/story',
};

const initialMessages: Message[] = [
  {
    id: 'welcome',
    text: 'Oi, minha princesa. Eu sou o seu Miranha. 🕷️❤️\n\nMe conta como o seu coração está hoje. Eu fico aqui com você.',
    from: 'miranha',
    time: 'agora',
  },
];

const declarations = [
  'Eu te amo por quem tu és, teu jeito é tão especial, forte, inteligente, dedicada, eu amo a forma em que você vê o mundo e que traz diversão ao mundo, esse jeitinho que busca pela justiça das pessoas, principalmente as que não conseguem se defender, que busca trazer a cor ao mundo daqueles que você ama, esse sorriso maravilhoso, esse olhar brilhante, amo até suas implicâncias kk, a mulher da minha vida, isso foi só 1% do porque eu te amo infinitamente! ❤️',
  'Eu amo muito os nossos momentos canônicos. Amo nossas aventuras e amo como conseguimos transformar até uma calçada em um momento de sonho, sentados olhando as estrelas. Com você, qualquer instante pode virar uma história inesquecível. ✨❤️',
  'Amar a ti é ter uma das melhores experiências da minha vida. Compartilhar a vida contigo, os momentos, as aventuras, as conquistas, as tristezas — o que for — é perfeito tendo você ao meu lado! Penedo, Campos do Jordão, Guaratiba, seja onde for, se torna nossa história! ❤️',
  'Você transforma momentos simples em memórias que eu quero guardar para sempre.',
  'Eu amo o carinho que você oferece, até quando o seu próprio coração está pedindo colo.',
  'A sua companhia faz qualquer lugar parecer casa. Com você, eu me sinto exatamente onde devo estar.',
  'Eu amo imaginar o nosso futuro, construído com pequenas escolhas, risadas e muito cuidado.',
  'Você é uma das partes mais bonitas da minha vida e eu nunca quero que você se esqueça disso.',
  'Até a saudade tem um lado bonito: ela prova o tamanho do espaço que você ocupa em mim.',
  'Eu quero cuidar de você nos dias leves e, principalmente, nos dias em que tudo parecer pesado.',
  'Eu amo a forma como você sente o mundo. Seu coração é intenso, bonito e raro.',
  'Você me inspira a ser mais paciente, mais presente e mais amoroso todos os dias.',
  'Eu te amo nas grandes aventuras e também no silêncio confortável de não fazer nada juntos.',
  'O seu abraço é o meu lugar favorito. Se eu pudesse, moraria nele um pouquinho todos os dias.',
  'Você me lembra que amar também é prestar atenção, escolher ficar e cuidar nos detalhes.',
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
    reference: 'Salmos 23',
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

const responseBank: Record<string, string[]> = {
  cansada: [
    'Ei, meu amor... vem cá. 🫂\n\nVocê não precisa ser forte o tempo inteiro.\n\nRespira um pouquinho. Descansa. O mundo pode esperar alguns minutos.\n\nE lembra: se hoje estiver pesado demais, chama o seu Miranha. 🕷️❤️ Eu estou aqui.',
    'Minha princesa, coloca o mundo no modo silencioso por um instante. Você já fez o bastante por hoje.\n\nBebe uma água, relaxa os ombros e recebe meu abraço daqui. Você não está sozinha.',
  ],
  triste: [
    'Ei... não precisa esconder o que está sentindo de mim. ❤️\n\nPode ficar triste. Pode chorar. Pode respirar e ficar quietinha.\n\nVocê não precisa enfrentar tudo sozinha.\n\nSeu Miranha está aqui.',
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
  default: [
    'Eu estou ouvindo, meu amor. Me conta mais um pouquinho — o que está passando nesse coração lindo?',
    'Vem cá, minha princesa. Eu quero entender você com calma. Seja o que for, você não precisa passar por isso sozinha.',
    'Seu Miranha recebeu a mensagem. ❤️ Eu fico aqui com você, sem pressa e sem julgamentos.',
  ],
};

function getResponse(text: string) {
  const normalized = text.toLowerCase();
  const key = Object.keys(responseBank).find((candidate) => normalized.includes(candidate));
  const options = responseBank[key ?? 'default'];
  return options[Math.floor(Math.random() * options.length)];
}

function nowLabel() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
  const [verseIndex, setVerseIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [story, setStory] = useState([
    { id: '1', title: 'Nosso primeiro capítulo ❤️', body: 'Escreva aqui como tudo começou...' },
    { id: '2', title: 'Um momento que nunca vou esquecer', body: 'Um detalhe, uma risada, um abraço...' },
    { id: '3', title: 'Nosso dia especial', body: 'A data que merece ser celebrada...' },
    { id: '4', title: 'Um sonho para o futuro', body: 'Algo que ainda vamos viver juntos...' },
  ]);
  const pulse = useRef(new Animated.Value(1)).current;
  const heartFloat = useRef(new Animated.Value(0)).current;

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
  }, [heartFloat, pulse]);

  useEffect(() => {
    AsyncStorage.multiGet([STORAGE_KEYS.messages, STORAGE_KEYS.story]).then(([savedMessages, savedStory]) => {
      if (savedMessages[1]) {
        try {
          setMessages(JSON.parse(savedMessages[1]) as Message[]);
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
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.story, JSON.stringify(story));
  }, [story]);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      const answer: Message = {
        id: `${Date.now()}-miranha`,
        text: getResponse(cleanDraft),
        from: 'miranha',
        time: nowLabel(),
      };
      setMessages((current) => [answer, ...current]);
      setIsTyping(false);
    }, 850);
  };

  const openWhatsApp = async () => {
    const url = 'https://wa.me/5521981198840?text=' + encodeURIComponent('🕷️ Chamado Aranha ativado! ❤️\nMeu amor, eu preciso do meu Miranha.');
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
        <QuickCard icon="sun" label="Preciso de motivação" accent="gold" onPress={() => openQuickAction('motivation')} styles={styles} colors={colors} />
        <QuickCard icon="book-open" label="Palavra para hoje" accent="green" onPress={() => openQuickAction('verse')} styles={styles} colors={colors} />
        <QuickCard icon="feather" label="Uma mensagem especial" accent="pink" onPress={() => openQuickAction('special')} styles={styles} colors={colors} />
      </View>

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

      <View style={styles.sectionHeading}><View><Text style={styles.sectionEyebrow}>FÉ & ACOLHIMENTO</Text><Text style={styles.sectionTitle}>Palavra para hoje</Text></View></View>
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
        <Text style={styles.promiseText}>Eu não prometo que todos os dias serão fáceis. Mas prometo que você nunca vai precisar atravessar um dia difícil se sentindo sozinha.</Text>
        <Text style={styles.promiseSign}>— seu Miranha</Text>
      </View>
      <Pressable style={styles.contactCard} onPress={() => setIsSummonOpen(true)} testID="contact-card">
        <View style={[styles.contactIcon, { backgroundColor: colors.primary }]}><MaterialCommunityIcons name="spider-thread" size={23} color={colors.primaryForeground} /></View>
        <View style={styles.contactCopy}><Text style={styles.contactTitle}>Chamado Aranha</Text><Text style={styles.contactSubtitle}>WhatsApp ou ligação, você escolhe.</Text></View>
        <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
      </Pressable>
      <View style={styles.safeNote}><Ionicons name="lock-closed-outline" size={15} color={colors.mutedForeground} /><Text style={styles.safeNoteText}>Este cantinho é salvo no seu dispositivo.</Text></View>
    </ScrollView>
  );

  const content = activeTab === 'home' ? renderHome() : activeTab === 'ia' ? renderChat() : activeTab === 'love' ? renderLove() : renderMiranha();

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
        declaration={declarations[declarationIndex]}
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

function QuickActionModal({ action, onClose, onChat, declaration, verse, styles, colors }: { action: QuickAction | null; onClose: () => void; onChat: () => void; declaration: string; verse: (typeof verses)[number]; styles: ReturnType<typeof createStyles>; colors: ReturnType<typeof useColors> }) {
  if (!action) return null;
  const isLove = action === 'love' || action === 'special';
  const isVerse = action === 'verse';
  const content = isLove ? declaration : isVerse ? `“${verse.verse}”\n\n${verse.note}` : action === 'motivation' ? 'Você já chegou tão longe, meu amor. Não deixe um dia difícil fazer você esquecer da mulher incrível que você é.\n\nUm passo de cada vez. Respira. Continua.\n\nE se cansar... eu fico aqui com você. ❤️🕷️' : action === 'tired' ? responseBank.cansada[0] : responseBank.triste[0];
  const title = isLove ? 'Por que eu te amo?' : isVerse ? `${verse.topic} para hoje` : action === 'motivation' ? 'Um empurrinho do seu Miranha' : action === 'tired' ? 'Vem descansar comigo' : 'Eu estou aqui com você';
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.smallModal}>
          <View style={styles.modalHandle} />
          <View style={styles.modalIcon}><Ionicons name={isVerse ? 'book-outline' : 'heart'} size={24} color={colors.pinkSoft} /></View>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalBody}>{content}</Text>
          <View style={styles.modalActions}>
            <Pressable style={styles.modalSecondary} onPress={onClose}><Text style={styles.modalSecondaryText}>Guardar no coração</Text></Pressable>
            <Pressable style={styles.modalPrimary} onPress={onChat}><Text style={styles.modalPrimaryText}>Falar com ele</Text><Feather name="arrow-up-right" size={17} color={colors.primaryForeground} /></Pressable>
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
    modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    smallModal: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 23, paddingBottom: 31, borderWidth: 1, borderColor: colors.border },
    summonModal: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 23, paddingBottom: 24, borderWidth: 1, borderColor: colors.border },
    modalHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 20 },
    modalIcon: { width: 52, height: 52, borderRadius: 19, backgroundColor: `${colors.primary}1A`, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 13 },
    modalTitle: { color: colors.foreground, fontSize: 23, lineHeight: 28, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5 },
    modalBody: { color: colors.mutedForeground, fontSize: 14, lineHeight: 21, marginTop: 15 },
    modalBodyCenter: { color: colors.mutedForeground, fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 18 },
    modalActions: { gap: 9, marginTop: 22 },
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