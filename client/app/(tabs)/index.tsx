import React, { useEffect, useState } from 'react'
import { Conversation, UserStory } from '@/types'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from '@/assets/styles/MessagesScreen.styles'
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import StoriesBar from '@/components/StoriesBar'
import StoryViewer from '@/components/StoryViewer'
import Convoitem from '@/components/Convoitem'
import { api } from '@/api/api'

export default function MessageScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null)
  const router = useRouter()

  const fetchConversations = async () => {
    setLoading(true)
    api.get<{success: boolean; conversations: Conversation[]}>("/api/messages/conversations").then(({data})=>{{
      if(data.success) setConversations(data.conversations);
      setLoading(false);
    }}).catch(()=>{
      setTimeout(fetchConversations, 1000)
    })
  }
  const lowerSearch = search.toLowerCase()
  const filtered = search ? conversations.filter((c)=>c.participant?.name.toLowerCase().includes(lowerSearch) || c.participant?.handle.toLowerCase().includes(lowerSearch)) : conversations;
  const openConvo = (c: Conversation) => {
    router.push(`/chat/${c._id}`);
  }
  useEffect(() => {
    fetchConversations()
  }, [])
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Conversations</Text>
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{conversations.length}</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name='search' size={16} color={Colors.outlineVariant} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder='Search conversations...'
          placeholderTextColor={Colors.outlineVariant}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={()=>setSearch("")}>
            <Ionicons name='close-circle' size={16} color={Colors.outlineVariant}/>
          </TouchableOpacity>
        )}
      </View>

      {/* Stories */}
      <StoriesBar onViewStory={(us)=> setSelectedStory(us)}/>
        {selectedStory && <StoryViewer userStory={selectedStory} onClose={()=>setSelectedStory(null)}/>}
      {/* Divider */}
      <View style={styles.divider}/>
      {/* Conversation List */}
      {loading ? (
        <ActivityIndicator style={{marginTop: 40}} color={Colors.primary}/>
      ) : (
        <FlatList 
        data={filtered}
        keyExtractor={(c)=>c._id}
        contentContainerStyle={styles.listContent}
        renderItem={({item})=> <Convoitem convo={item} selected={false} onPress={()=>openConvo(item)}
        />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name='chatbubbles-outline' size={44} color={Colors.outlineVariant}/>
            <Text style={styles.emptyTitle}>No Conversations yet.</Text>
            <Text style={styles.emptySubtitle}>Go to Search to start chatting.</Text>
          </View>
        }
        />
      )}
    </SafeAreaView>
  )
}