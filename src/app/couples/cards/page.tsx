'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { CONVERSATION_DECKS } from '@/lib/couples';

export default function CardsPage() {
  const [activeDeck, setActiveDeck] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const deckKeys = Object.keys(CONVERSATION_DECKS) as (keyof typeof CONVERSATION_DECKS)[];

  const drawCard = useCallback(() => {
    if (!activeDeck) return;
    const deck = CONVERSATION_DECKS[activeDeck as keyof typeof CONVERSATION_DECKS];
    const newIndex = Math.floor(Math.random() * deck.cards.length);
    setCurrentIndex(newIndex);
    setRevealed(false);
    // Brief delay for the flip animation
    setTimeout(() => setRevealed(true), 100);
  }, [activeDeck]);

  const selectDeck = useCallback((key: string) => {
    setActiveDeck(key);
    setCurrentIndex(0);
    setRevealed(false);
    setTimeout(() => setRevealed(true), 100);
  }, []);

  if (activeDeck) {
    const deck = CONVERSATION_DECKS[activeDeck as keyof typeof CONVERSATION_DECKS];
    const card = deck.cards[currentIndex];

    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-border px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/couples" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
            <button onClick={() => setActiveDeck(null)} className="text-xs text-secondary hover:text-foreground">
              ← All Decks
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <p className="text-xs text-secondary font-mono mb-2">{deck.name} Deck</p>

          {/* Card */}
          <div
            className={`w-full max-w-sm aspect-[3/4] rounded-lg border-2 border-accent flex items-center justify-center p-8 transition-all duration-500 ${
              revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <p className="font-serif text-lg text-center leading-relaxed">{card}</p>
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={() => setActiveDeck(null)} className="btn-secondary text-sm">
              Switch Deck
            </button>
            <button onClick={drawCard} className="btn-primary text-sm">
              Draw Another
            </button>
          </div>

          <p className="text-[10px] text-secondary mt-4">
            Card {currentIndex + 1} of {deck.cards.length}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/couples" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
          <Link href="/couples" className="text-xs text-secondary hover:text-foreground">← Dashboard</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-1">Conversation Cards</h2>
        <p className="text-sm text-secondary mb-6">Choose a deck and draw a card. Take turns answering honestly.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {deckKeys.map(key => {
            const deck = CONVERSATION_DECKS[key];
            return (
              <button
                key={key}
                onClick={() => selectDeck(key)}
                className="card text-left hover:border-accent transition-colors"
              >
                <p className="font-serif text-lg font-semibold mb-1">{deck.name}</p>
                <p className="text-xs text-secondary mb-2">{deck.description}</p>
                <p className="text-[10px] font-mono text-accent">{deck.cards.length} cards</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
