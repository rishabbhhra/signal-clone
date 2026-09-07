"use client";

import React, { useState, useMemo } from "react";
import { Search, MoreHorizontal } from "lucide-react";

interface EmojiStickerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  onSelectMedia?: (url: string, type: "image" | "sticker" | "gif") => void;
}

type PickerTab = "emoji" | "stickers" | "gifs";

const CATEGORIES = [
  {
    id: "smileys",
    name: "Smileys & People",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
      "🙂", "🙃", "🫠", "😉", "😊", "😇", "🥰", "😍",
      "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛",
      "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🫢", "🫣",
      "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶",
      "🫥", "😶‍🌫️", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥",
      "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕",
      "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "😵‍💫",
      "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕",
      "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺",
      "🥹", "😦", "😧", "😨", "😰", "😥", "😢", "😭",
      "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱",
      "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️",
      "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖",
      "👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳",
      "🫴", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘",
      "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "🫵",
      "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌",
      "🫶", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳",
      "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃",
      "🧠", "🫀", "🫁", "🦷", "🦴", "👀", "👁️", "👅",
    ],
  },
  {
    id: "animals",
    name: "Animals & Nature",
    icon: "🐻",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
      "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸",
      "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦",
      "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺",
      "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌",
      "🐞", "🐜", "🪰", "🪲", "🪳", "🦟", "🦗", "🕷️",
      "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑",
      "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳",
      "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧",
      "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘",
      "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑",
      "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈",
      "🐈‍⬛", "🪶", "🐓", "🦃", "🦤", "🦚", "🦜", "🦢",
      "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", "🦫", "🦦",
      "🦥", "🐁", "🐀", "🐿️", "🦔", "🐾", "🐉", "🐲",
      "🌵", "🎄", "🌲", "🌳", "🌴", "🪵", "🌱", "🌿",
      "☘️", "🍀", "🎍", "🪴", "🎋", "🍃", "🍂", "🍁",
      "🍄", "🌾", "💐", "🌷", "🌹", "🥀", "🌺", "🌸",
    ],
  },
  {
    id: "food",
    name: "Food & Drink",
    icon: "☕",
    emojis: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇",
      "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥",
      "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️",
      "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠",
      "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳",
      "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴",
      "🌭", "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆",
      "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🥫", "🍝",
      "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤",
      "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡",
      "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮",
      "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜",
      "🍯", "🥛", "🍼", "☕", "🫖", "🍵", "🍶", "🍾",
      "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🥤",
    ],
  },
  {
    id: "activities",
    name: "Activities",
    icon: "⚽",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉",
      "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍",
      "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿",
      "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌",
      "🎿", "⛷️", "🏂", "🪂", "🏋️", "🤼", "🤸", "⛹️",
      "🤺", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽",
      "🚣", "🧗", "🚵", "🚴", "🏆", "🥇", "🥈", "🥉",
      "🏅", "🎖️", "🏵️", "🎗️", "🎫", "🎟️", "🎪", "🤹",
      "🎭", "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹",
      "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🎲", "♟️",
      "🎯", "🎳", "🎮", "🎰", "🧩", "🎳", "🎱", "🎲",
    ],
  },
  {
    id: "travel",
    name: "Travel & Places",
    icon: "🚗",
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑",
      "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🦯", "🦽",
      "🦼", "🛴", "🚲", "🛵", "🏍️", "🛺", "🚨", "🚔",
      "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋",
      "🚞", "🚝", "🚄", "🚅", "🚈", "🚂", "🚆", "🚇",
      "🚊", "🚉", "✈️", "🛫", "🛬", "🛩️", "💺", "🛰️",
      "🚀", "🛸", "🚁", "🛶", "⛵", "🚤", "🛥️", "🛳️",
      "⛴️", "🚢", "⚓", "🛟", "⛽", "🚧", "🛑", "🚥",
      "🚦", "🗿", "🗽", "🗼", "🏰", "🏯", "🏟️", "🎡",
    ],
  },
  {
    id: "objects",
    name: "Objects",
    icon: "💡",
    emojis: [
      "💡", "🔦", "🕯️", "🪔", "🧱", "💈", "🪜", "🪛",
      "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🪚", "🔩", "⚙️",
      "🪤", "🧲", "🔫", "💣", "🧨", "🪓", "🔪", "🗡️",
      "⚔️", "🛡️", "🚬", "⚰️", "🪦", "⚱️", "🏺", "🔮",
      "📿", "🧿", "🪞", "🪟", "🛋️", "🪑", "🚽", "🪠",
      "🚿", "🛁", "🧴", "🧷", "🧹", "🧺", "🧻", "🪣",
      "🧼", "🫧", "🪥", "🧽", "🧯", "🛒", "📦", "🏷️",
      "🪙", "💴", "💵", "💶", "💷", "💸", "💳", "🧾",
    ],
  },
  {
    id: "symbols",
    name: "Symbols",
    icon: "🔣",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
      "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
      "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️",
      "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎", "♈",
      "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐",
      "♑", "♒", "♓", "🆔", "⚛️", "☢️", "☣️", "📴",
      "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚",
      "💮", "🉐", "㊙️", "㊗️", "🈴", "🈵", "🈹", "🈲",
    ],
  },
  {
    id: "flags",
    name: "Flags",
    icon: "🚩",
    emojis: [
      "🚩", "🏁", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️",
      "🇺🇸", "🇬🇧", "🇮🇳", "🇨🇦", "🇦🇺", "🇩🇪", "🇫🇷", "🇮🇹",
      "🇪🇸", "🇯🇵", "🇰🇷", "🇨🇳", "🇧🇷", "🇲🇽", "🇷🇺", "🇿🇦",
      "🇦🇷", "🇧🇪", "🇨🇭", "🇳🇱", "🇸🇪", "🇳🇴", "🇩🇰", "🇫🇮",
    ],
  },
];

// Sample Signal Stickers
const STICKERS = [
  { id: "s1", name: "Thumbs Up", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&h=150&fit=crop" },
  { id: "s2", name: "Heart", url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=150&h=150&fit=crop" },
  { id: "s3", name: "Celebration", url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&h=150&fit=crop" },
  { id: "s4", name: "Cat Wave", url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop" },
  { id: "s5", name: "Dog Smile", url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&h=150&fit=crop" },
  { id: "s6", name: "Coffee Time", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&h=150&fit=crop" },
];

// Sample Signal GIFs
const GIFS = [
  { id: "g1", title: "Applause", url: "https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif" },
  { id: "g2", title: "Celebration", url: "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif" },
  { id: "g3", title: "Thumbs Up", url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif" },
  { id: "g4", title: "Dancing", url: "https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif" },
  { id: "g5", title: "Mind Blown", url: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif" },
  { id: "g6", title: "Laughing", url: "https://media.giphy.com/media/Q7ozWVYCR0nyW2rvPW/giphy.gif" },
];

export const EmojiStickerPicker: React.FC<EmojiStickerPickerProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  onSelectMedia,
}) => {
  const [activeTab, setActiveTab] = useState<PickerTab>("emoji");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("smileys");

  const currentCategory = useMemo(() => {
    return CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  }, [selectedCategory]);

  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      return currentCategory.emojis;
    }
    const q = searchQuery.toLowerCase();
    // Search all categories
    const results: string[] = [];
    CATEGORIES.forEach((cat) => {
      cat.emojis.forEach((e) => {
        if (!results.includes(e)) results.push(e);
      });
    });
    return results.slice(0, 72);
  }, [searchQuery, currentCategory]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute left-3 bottom-full mb-3 w-[336px] h-[430px] bg-[#28282c] border border-[#38383c]/70 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 select-none">
        {/* Top Segmented Controls (Matching Screenshot media_1788808987694.png) */}
        <div className="p-2.5 pb-1.5 flex items-center justify-center">
          <div className="flex items-center gap-1 bg-[#1e1e20] p-1 rounded-full border border-[#323236]">
            {(["emoji", "stickers", "gifs"] as PickerTab[]).map((tab) => {
              const label = tab === "emoji" ? "Emoji" : tab === "stickers" ? "Stickers" : "GIFs";
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1 text-xs font-semibold rounded-full transition-all ${
                    isActive
                      ? "bg-[#3e3e44] text-white shadow-xs"
                      : "text-[#8e8e93] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-1.5">
          <div className="flex items-center bg-[#202022] rounded-xl px-3 py-1.5 border border-transparent focus-within:border-[#3a76f0]/50 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder={
                activeTab === "emoji"
                  ? "Search emoji"
                  : activeTab === "stickers"
                  ? "Search stickers"
                  : "Search GIFs"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white text-xs placeholder-[#8e8e93] focus:outline-hidden flex-1"
            />
          </div>
        </div>

        {/* Content Body */}
        {activeTab === "emoji" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Section Header */}
            <div className="px-3.5 pt-1.5 pb-1 flex items-center justify-between text-xs font-semibold text-[#8e8e93]">
              <span>{searchQuery ? "Search Results" : currentCategory.name}</span>
              <button type="button" className="hover:text-white p-0.5 rounded">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* 8-Column Emoji Grid (Matching Screenshot media_1788808987694.png) */}
            <div className="flex-1 px-2.5 overflow-y-auto min-h-0">
              <div className="grid grid-cols-8 gap-0.5 pb-2">
                {filteredEmojis.map((emoji, idx) => (
                  <button
                    key={`${emoji}-${idx}`}
                    type="button"
                    onClick={() => onSelectEmoji(emoji)}
                    className="w-9 h-9 flex items-center justify-center text-2xl rounded-lg hover:bg-[#38383e] hover:scale-115 active:scale-95 transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom 8 Category Icons Bar */}
            <div className="h-10 bg-[#222224] border-t border-[#323236] flex items-center justify-between px-3 flex-shrink-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSearchQuery("");
                  }}
                  className={`text-base p-1 rounded-md transition-all ${
                    selectedCategory === cat.id && !searchQuery
                      ? "scale-120 bg-[#34343a]"
                      : "opacity-70 hover:opacity-100 hover:scale-110"
                  }`}
                  title={cat.name}
                >
                  {cat.icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stickers Tab */}
        {activeTab === "stickers" && (
          <div className="flex-1 p-3 overflow-y-auto grid grid-cols-3 gap-2">
            {STICKERS.map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                onClick={() => {
                  if (onSelectMedia) onSelectMedia(sticker.url, "sticker");
                  onClose();
                }}
                className="aspect-square bg-[#222226] hover:bg-[#2d2d34] rounded-xl p-1.5 flex flex-col items-center justify-center border border-[#323238] transition-all hover:scale-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <span className="text-[10px] text-gray-300 mt-1 truncate max-w-full">
                  {sticker.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* GIFs Tab */}
        {activeTab === "gifs" && (
          <div className="flex-1 p-3 overflow-y-auto grid grid-cols-2 gap-2">
            {GIFS.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => {
                  if (onSelectMedia) onSelectMedia(gif.url, "gif");
                  onClose();
                }}
                className="relative aspect-video bg-[#222226] hover:bg-[#2d2d34] rounded-xl overflow-hidden border border-[#323238] transition-all hover:scale-105"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gif.url}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-0.5 text-[10px] text-white truncate">
                  {gif.title}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
