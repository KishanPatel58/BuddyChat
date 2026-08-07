import React, { useEffect, useState } from 'react'
import { Conversation, UserStory } from '@/types'
import { useRouter } from 'expo-router'
import { dummyConversationData } from '@/assets/assets'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from '@/assets/styles/MessagesScreen.styles'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import StoriesBar from '@/components/StoriesBar'

export default function MessageScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null)
  const router = useRouter()

  const fetchConversations = async () => {
    setLoading(true)
    setTimeout(() => {
      setConversations(dummyConversationData as any)
      setLoading(false)
    }, 3000)
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

      {/* Divider */}

      {/* Conversation List */}
    </SafeAreaView>
  )
}