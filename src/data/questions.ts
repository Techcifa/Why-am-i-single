export type CategoryId =
    | 'communication'
    | 'availability'
    | 'habits'
    | 'lifestyle'
    | 'social'
    | 'standards'
    | 'growth';

export interface Option {
    id: string;
    label: string;
    value: number; // 0-3 scale usually
    tags: CategoryId[];
}

export interface Question {
    id: string;
    category: CategoryId;
    text: string;
    options: Option[];
}

export const QUESTIONS: Question[] = [
    // --- Communication ---
    {
        id: 'comm_1',
        category: 'communication',
        text: 'When a disagreement starts with someone you’re dating, what is your first instinct?',
        options: [
            { id: 'a', label: 'I usually withdraw or go silent to avoid making it worse.', value: 2, tags: ['communication'] },
            { id: 'b', label: 'I try to fix it immediately, sometimes feeling anxious if it’s not resolved.', value: 2, tags: ['communication'] },
            { id: 'c', label: 'I listen and try to understand their side before explaining mine.', value: 0, tags: ['communication'] },
            { id: 'd', label: 'I get defensive if I feel attacked.', value: 2, tags: ['communication'] },
        ]
    },
    {
        id: 'comm_2',
        category: 'communication',
        text: 'How comfortable are you expressing your needs in the early stages of dating?',
        options: [
            { id: 'a', label: 'Very uncomfortable. I don’t want to seem "needy".', value: 3, tags: ['communication'] },
            { id: 'b', label: 'I drop hints and hope they pick up on them.', value: 2, tags: ['communication'] },
            { id: 'c', label: 'Comfortable. I say what I mean clearly and kindly.', value: 0, tags: ['communication'] },
            { id: 'd', label: 'I tend to focus entirely on their needs instead of mine.', value: 2, tags: ['communication'] },
        ]
    },

    // --- Emotional Availability ---
    {
        id: 'avail_1',
        category: 'availability',
        text: 'When someone you like starts getting really close to you emotionally, how do you feel?',
        options: [
            { id: 'a', label: 'Excited and secure.', value: 0, tags: ['availability'] },
            { id: 'b', label: 'I panic slightly and wonder if I’m losing my freedom.', value: 3, tags: ['availability'] },
            { id: 'c', label: 'I worry they will see the "real" me and leave.', value: 3, tags: ['availability'] },
            { id: 'd', label: 'I lose interest once the "chase" is over.', value: 3, tags: ['availability'] },
        ]
    },
    {
        id: 'avail_2',
        category: 'availability',
        text: 'How do you process your own difficult emotions?',
        options: [
            { id: 'a', label: 'I often numb out or distract myself (work, scrolling, going out).', value: 2, tags: ['availability'] },
            { id: 'b', label: 'I rely heavily on a partner to soothe me.', value: 2, tags: ['availability'] },
            { id: 'c', label: 'I take time to reflect, maybe talk to a friend, and process it.', value: 0, tags: ['availability'] },
        ]
    },

    // --- Standards & Flexibility ---
    {
        id: 'stand_1',
        category: 'standards',
        text: 'When you meet a new potential partner, what do you look for first?',
        options: [
            { id: 'a', label: 'Reasons why it won’t work (red flags).', value: 3, tags: ['standards'] },
            { id: 'b', label: 'Chemistry and spark.', value: 1, tags: ['standards'] },
            { id: 'c', label: 'Shared values and how I feel around them.', value: 0, tags: ['standards'] },
            { id: 'd', label: 'If they check every box on my list.', value: 2, tags: ['standards'] },
        ]
    },
    {
        id: 'stand_2',
        category: 'standards',
        text: 'How do you view "settling"?',
        options: [
            { id: 'a', label: 'I refuse to settle. I want everything perfect or nothing.', value: 3, tags: ['standards'] },
            { id: 'b', label: 'I’m terrified of settling, so I end things quickly.', value: 2, tags: ['standards'] },
            { id: 'c', label: 'Compromise is normal, but core values aren’t negotiable.', value: 0, tags: ['standards'] },
        ]
    },

    // --- Lifestyle & Priorities ---
    {
        id: 'life_1',
        category: 'lifestyle',
        text: 'How does a relationship fit into your current life?',
        options: [
            { id: 'a', label: 'It’s my #1 priority above everything else.', value: 2, tags: ['lifestyle'] },
            { id: 'b', label: 'I’m extremely busy; I don’t know where I’d fit one in.', value: 3, tags: ['lifestyle'] },
            { id: 'c', label: 'I have a full life, but I make space for connection.', value: 0, tags: ['lifestyle'] },
            { id: 'd', label: 'I’m happy alone, maybe too happy to change my routine.', value: 2, tags: ['lifestyle'] },
        ]
    },

    // --- Social Behavior ---
    {
        id: 'soc_1',
        category: 'social',
        text: 'How often do you put yourself in situations to meet new people?',
        options: [
            { id: 'a', label: 'Rarely. I stick to my existing circle.', value: 3, tags: ['social'] },
            { id: 'b', label: 'I use apps, but rarely go on actual dates.', value: 2, tags: ['social'] },
            { id: 'c', label: 'Frequently. I’m open to meeting people anywhere.', value: 0, tags: ['social'] },
            { id: 'd', label: 'I wait for them to come to me.', value: 2, tags: ['social'] },
        ]
    },

    // --- Dating Habits ---
    {
        id: 'habit_1',
        category: 'habits',
        text: 'Reflecting on your past relationships, is there a pattern?',
        options: [
            { id: 'a', label: 'I tend to date "projects" I need to fix.', value: 3, tags: ['habits'] },
            { id: 'b', label: 'They usually leave me suddenly.', value: 2, tags: ['habits'] },
            { id: 'c', label: 'I lose interest as soon as it gets serious.', value: 3, tags: ['habits'] },
            { id: 'd', label: 'Every relationship has been different.', value: 0, tags: ['habits'] },
        ]
    },
    {
        id: 'habit_2',
        category: 'habits',
        text: 'How do you handle rejection in dating?',
        options: [
            { id: 'a', label: 'I take it very personally and give up for a while.', value: 2, tags: ['habits'] },
            { id: 'b', label: 'I get angry or resentful.', value: 2, tags: ['habits'] },
            { id: 'c', label: 'It stings, but I move on knowing it wasn’t a match.', value: 0, tags: ['habits'] },
        ]
    },

    // --- Self Growth ---
    {
        id: 'grow_1',
        category: 'growth',
        text: 'How happy are you with your life outside of dating?',
        options: [
            { id: 'a', label: 'Not very. I feel I need a partner to be happy.', value: 3, tags: ['growth'] },
            { id: 'b', label: 'I’m content, but I often feel like something is missing.', value: 1, tags: ['growth'] },
            { id: 'c', label: 'I love my life. A partner would just be a bonus.', value: 0, tags: ['growth'] },
        ]
    }
];

export const INSIGHTS_DB: Record<CategoryId, { title: string; content: string; suggestion: string }[]> = {
    communication: [
        {
            title: "Silent treatment limits connection",
            content: "You may tend to withdraw during conflict. While this protects you in the moment, it can leave partners feeling shut out.",
            suggestion: "Try saying 'I need a moment to think' instead of going silent."
        },
        {
            title: "Hyper-independence",
            content: "You might find it hard to express needs because you're used to doing everything yourself.",
            suggestion: "Experiment with asking for small favors to build trust."
        }
    ],
    availability: [
        {
            title: "Fear of intimacy",
            content: "Patterns suggest you might pull away when things get 'real'. This is often a protective mechanism, not a lack of capability for love.",
            suggestion: "Reflect on what getting 'hurt' actually means to you now vs. in the past."
        }
    ],
    habits: [
        {
            title: "Attracted to potential",
            content: "You may be dating who people *could* be, rather than who they are right now.",
            suggestion: "Try evaluating your next date strictly on who they are today."
        }
    ],
    lifestyle: [
        {
            title: "Too busy for love?",
            content: "Your life is full, which is great, but there might not be practical space for a partner right now.",
            suggestion: "Look at your schedule. Where would a partner actually fit?"
        }
    ],
    social: [
        {
            title: "Waiting to be found",
            content: "You might be hoping love finds you without changing your routine. Love often requires new contexts.",
            suggestion: "Try one new social activity this month where the goal isn't dating."
        }
    ],
    standards: [
        {
            title: "The perfection trap",
            content: "Looking for reasons to say 'no' keeps you safe, but it also keeps you single.",
            suggestion: "Try looking for 'green flags' first on your next date."
        }
    ],
    growth: [
        {
            title: "External validation",
            content: "You might be looking for a relationship to 'fix' how you feel about your life.",
            suggestion: "Focus on building a life you love on your own first."
        }
    ]
};
