"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useConversation } from "@elevenlabs/react";

import { cn } from "@/lib/utils";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ Connected to ElevenLabs");
      setIsConnecting(false);
      setCallStatus(CallStatus.ACTIVE);
    },
    onDisconnect: () => {
      console.log("❌ Disconnected from ElevenLabs");
      setIsConnecting(false);
      setCallStatus(CallStatus.FINISHED);
      // Clean up microphone stream
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        setMicStream(null);
      }
    },
    onMessage: (message) => {
      console.log("📨 Message received:", message);
      const role = message.source === "user" ? "user" : "assistant";
      const newMessage: SavedMessage = { role, content: message.message };
      setMessages((prev) => [...prev, newMessage]);
      if (role === "assistant") {
        setLastMessage(message.message);
      }
    },
    onError: (error) => {
      console.error("❌ ElevenLabs Error:", error);
      setIsConnecting(false);
      setCallStatus(CallStatus.INACTIVE);
      // Clean up on error
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        setMicStream(null);
      }
    },
  });

  const { status, isSpeaking, startSession, endSession } = conversation;

  useEffect(() => {
    // Sync internal callStatus with hook status if needed, 
    // but we are managing callStatus manually for FINISHED state logic
    if (status === "connected") {
      setCallStatus(CallStatus.ACTIVE);
    } else if (status === "connecting") {
      setCallStatus(CallStatus.CONNECTING);
    }
  }, [status]);

  useEffect(() => {
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("📊 Generating feedback...");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("❌ Error saving feedback");
        router.push("/");
      }
    };

    // Only redirect if the call actually finished (not if it failed to connect)
    // Check that we have messages, which means the call was actually active
    if (callStatus === CallStatus.FINISHED && messages.length > 0) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    console.log("🎤 Starting call...");
    setCallStatus(CallStatus.CONNECTING);
    setIsConnecting(true);

    try {
      // Request microphone permission first
      console.log("🎤 Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      console.log("✅ Microphone permission granted");
      console.log("🎙️ Audio tracks:", stream.getAudioTracks().map(t => ({
        label: t.label,
        enabled: t.enabled,
        muted: t.muted,
        readyState: t.readyState
      })));
      
      setMicStream(stream);
      
      // Format questions for the agent
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
        console.log("📝 Formatted questions:", formattedQuestions);
      }

      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      console.log("🤖 Agent ID:", agentId);

      if (!agentId) {
        throw new Error("NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not configured");
      }

      // Start the conversation with the agent
      console.log("🚀 Starting ElevenLabs session...");
      await startSession({
        agentId: agentId,
        connectionType: "websocket",
      });
      
      console.log("✅ Session started successfully");
      console.log("🎧 Listening for user input...");
      
    } catch (error) {
      console.error("❌ Failed to start conversation:", error);
      setCallStatus(CallStatus.INACTIVE);
      setIsConnecting(false);
      
      // Clean up stream on error
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        setMicStream(null);
      }
      
      // Show user-friendly error message
      alert(`Failed to start call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDisconnect = async () => {
    await endSession();
    setCallStatus(CallStatus.FINISHED);
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-3xl">🤖</span>
            </div>
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <div className="size-[120px] rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/30">
              <span className="text-6xl">👤</span>
            </div>
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
