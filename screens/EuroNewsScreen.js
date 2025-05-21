import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Linking, TouchableOpacity, StyleSheet } from 'react-native';
import { XMLParser } from 'fast-xml-parser';
import * as Localization from 'expo-localization';

const languageFlags = {
  it: '🇮🇹',
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  default: '🏳️',
};

const RSS_URL = 'https://www.consilium.europa.eu/it/rss/pressreleases.ashx';
const DEEPL_API = 'https://api-free.deepl.com/v2/translate';
const DEEPL_API_KEY = '2a5b6930-92ca-4b74-b5cc-10be07e650dc:fx';

const EuroNewsScreen = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const userLang = Localization.locale.split('-')[0];

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        const response = await fetch(RSS_URL);
        const text = await response.text();

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '',
          removeNSPrefix: true,
          ignoreDeclaration: true,
        });

        const parsed = parser.parse(text);
        const items = parsed?.rss?.channel?.item;
        if (!items) throw new Error('Nessun elemento trovato');

        const normalized = Array.isArray(items) ? items : [items];

        const enrichedNews = await Promise.all(normalized.map(async (item) => {
          let langCode = 'it';
          let readMinutes = 1;
          let translatedTitle = null;
          let translatedExcerpt = null;

          try {
            const res = await fetch(item.link);
            const html = await res.text();
            const match = html.match(/<p[^>]*>(.*?)<\/p>/g);
            const filteredParagraphs = match?.filter(p => !p.toLowerCase().includes('cookie')) || [];
            const plainText = filteredParagraphs.map(p => p.replace(/<[^>]+>/g, '')).join(' ');
            const excerpt = filteredParagraphs[0]?.replace(/<[^>]+>/g, '') || '';
            const wordCount = plainText.split(/\s+/).length;
            readMinutes = Math.max(1, Math.round(wordCount / 200));

            const isEnglish = / the | and | with | to | from /i.test(plainText);
            langCode = isEnglish ? 'en' : 'it';

            item.excerpt = excerpt;
          } catch (err) {
            console.warn('Errore durante il fetch dell’articolo:', err);
          }

          return { ...item, langCode, readMinutes, showTranslation: false, translatedTitle, translatedExcerpt };
        }));

        setNews(enrichedNews);
      } catch (error) {
        console.error("Errore durante il parsing RSS:", error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRSS();
  }, []);

  const handleTranslate = async (index) => {
    const original = news[index];

    if (!original.title && !original.excerpt) {
      console.warn('❗ Nessun contenuto da tradurre');
      return;
    }

    if (original.translatedTitle && original.translatedExcerpt) {
      const updated = [...news];
      updated[index].showTranslation = !updated[index].showTranslation;
      setNews(updated);
      return;
    }

    try {
      const translateWithDeepL = async (text, targetLang) => {
        const params = new URLSearchParams();
        params.append('auth_key', DEEPL_API_KEY);
        params.append('text', text);
        params.append('target_lang', targetLang.toUpperCase());

        const response = await fetch(DEEPL_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        const data = await response.json();
        return data?.translations?.[0]?.text || text;
      };

      const translatedTitle = await translateWithDeepL(original.title, userLang);
      const translatedExcerpt = await translateWithDeepL(original.excerpt || original.title, userLang);

      const updated = [...news];
      updated[index].translatedTitle = translatedTitle;
      updated[index].translatedExcerpt = translatedExcerpt;
      updated[index].showTranslation = true;
      setNews(updated);
    } catch (err) {
      console.error('❌ Errore durante la traduzione con DeepL:', err);
    }
  };

  const openLink = (url) => {
    Linking.openURL(url);
  };
  
  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => openLink(item.link, true)} activeOpacity={0.85}>
        <Text style={styles.title}>{item.showTranslation && item.translatedTitle ? item.translatedTitle : item.title}</Text>
        {item.showTranslation && item.translatedExcerpt && (
          <Text style={styles.translatedExcerpt}>{item.translatedExcerpt}</Text>
        )}
        <Text style={styles.date}>{item.updated || item.pubDate || 'Data non disponibile'}</Text>
        <Text style={styles.source}>Fonte: Sala Stampa Parlamento EU</Text>

        <View style={styles.tagsContainer}>
          {Array.isArray(item.category)
            ? item.category.map((cat, idx) => (
                <View key={idx} style={styles.tag}><Text style={styles.tagText}>{cat}</Text></View>
              ))
            : item.category && (
                <View style={styles.tag}><Text style={styles.tagText}>{item.category}</Text></View>
              )
          }
        </View>
        <View style={styles.bottomRight}>
          <Text style={styles.lang}>{languageFlags[item.langCode] || languageFlags.default}</Text>
          <Text style={styles.readingTime}>{item.readMinutes} min</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleTranslate(index)}>
        <Text style={styles.translationButton}>
          {item.showTranslation ? 'Nascondi traduzione' : 'Vedi traduzione'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Euro News</Text>
      <View style={styles.underline} />

      {loading ? (
        <ActivityIndicator size="large" color="#FFCC00" style={{ marginTop: 20 }} />
      ) : news.length === 0 ? (
        <Text style={styles.noNews}>Nessuna notizia disponibile.</Text>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item, index) => `${item.guid || item.title}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      )}
    </View>
  );
};

export default EuroNewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
    paddingHorizontal: 12,
    paddingTop: 50,
  },
  header: {
  fontSize: 30,
  color: '#FFCC00',
  fontWeight: 'bold',
  textAlign: 'center',
  marginTop: 16,
  marginBottom: 8,
},
underline: {
  height: 2,
  backgroundColor: '#FFCC00',
  width: '100%',
  marginTop: 16,
  marginBottom: 30,
},
  noNews: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    position: 'relative',
  },
  title: {
    fontSize: 15,
    color: '#003399',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  translated: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  translatedExcerpt: {
    fontSize: 13,
    color: '#444',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  translationButton: {
    color: '#007AFF',
    fontSize: 13,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#003399',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 11,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    alignItems: 'flex-end',
  },
  lang: {
    fontSize: 16,
    marginBottom: 2,
  },
  readingTime: {
    fontSize: 12,
    color: '#444',
  },
  source: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  
});
