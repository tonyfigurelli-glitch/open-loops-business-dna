export type SourceType = "thought" | "chat" | "manual" | "system";

export type LoopStatus = "new" | "active" | "growing" | "ready" | "archived";

export type ConfidenceLevel = "low" | "medium" | "high";

export type BubbleTone = "violet" | "blue" | "green" | "orange" | "silver";

export type BubbleSize = "large" | "medium" | "small";

export type Thought = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  sourceType: SourceType;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  relatedChatSessionIds: string[];
  tags: string[];
  themes: string[];
};

export type OpenLoop = {
  id: string;
  title: string;
  description: string;
  status: LoopStatus;
  createdAt: string;
  updatedAt: string;
  thoughtCount: number;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  relatedChatSessionIds: string[];
  tags: string[];
  themes: string[];
  bubble: {
    tone: BubbleTone;
    size: BubbleSize;
    x: string;
    y: string;
  };
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  relatedChatSessionIds: string[];
  tags: string[];
  themes: string[];
};

export type ChatMessage = {
  id: string;
  chatSessionId: string;
  role: "user" | "lumi";
  content: string;
  createdAt: string;
  sourceType: SourceType;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  tags: string[];
  themes: string[];
};

export type LoopConnection = {
  id: string;
  loopIds: [string, string];
  connectionReason: string;
  confidenceLevel: ConfidenceLevel;
  createdAt: string;
  updatedAt: string;
  relatedThoughtIds: string[];
  relatedChatSessionIds: string[];
  tags: string[];
  themes: string[];
};

export type Insight = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  sourceType: SourceType;
  confidenceLevel: ConfidenceLevel;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  relatedChatSessionIds: string[];
  connectionId?: string;
  tags: string[];
  themes: string[];
};

export type TimelineEvent = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  sourceType: SourceType;
  relatedThoughtIds: string[];
  relatedLoopIds: string[];
  relatedChatSessionIds: string[];
  tags: string[];
  themes: string[];
};
