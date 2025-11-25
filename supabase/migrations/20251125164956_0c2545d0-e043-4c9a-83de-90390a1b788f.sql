-- Fix infinite recursion in conversation_participants RLS policies
-- Create a security definer function to check conversation participation

CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
  )
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Participants can view themselves" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update own participation" ON public.conversation_participants;

-- Recreate policies using the security definer function
CREATE POLICY "Participants can view themselves"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Users can join conversations"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own participation"
ON public.conversation_participants
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Also fix the conversations table policy
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;

CREATE POLICY "Participants can view conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (public.is_conversation_participant(id, auth.uid()));