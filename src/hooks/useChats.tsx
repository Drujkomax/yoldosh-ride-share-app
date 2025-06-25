
import { useState, useEffect } from 'react'
import { supabase, Chat, Message } from '@/lib/supabase'
import { useAuth } from './useAuth'

export const useChats = () => {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(false)

  const getUserChats = async () => {
    if (!user) return []

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .contains('participants', [user.id])
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (error) throw error
      setChats(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching chats:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const createOrGetChat = async (participantId: string) => {
    if (!user) throw new Error('User not authenticated')

    // Check if chat already exists
    const { data: existingChat, error: searchError } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [user.id, participantId])
      .single()

    if (existingChat) return existingChat

    // Create new chat
    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          participants: [user.id, participantId]
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  const sendMessage = async (chatId: string, content: string) => {
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: chatId,
          sender_id: user.id,
          content
        }
      ])
      .select()
      .single()

    if (error) throw error

    // Update chat's last message
    await supabase
      .from('chats')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString()
      })
      .eq('id', chatId)

    return data
  }

  const getChatMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users(id, name)
      `)
      .eq('chat_id', chatId)
      .order('created_at')

    if (error) throw error
    return data || []
  }

  useEffect(() => {
    if (user) {
      getUserChats()
    }
  }, [user])

  return {
    chats,
    loading,
    getUserChats,
    createOrGetChat,
    sendMessage,
    getChatMessages
  }
}
