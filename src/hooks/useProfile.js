import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

/**
 * Hook to load and save user_profiles fields.
 * Returns { profile, saving, updateProfile }
 */
export function useProfile() {
  const { user, profile: ctxProfile, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)

  const updateProfile = useCallback(async (fields) => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ id: user.id, ...fields, updated_at: new Date().toISOString() })
      if (error) throw error
      await refreshProfile()
    } catch (err) {
      toast.error('Gagal menyimpan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }, [user, refreshProfile])

  return { profile: ctxProfile, saving, updateProfile }
}
