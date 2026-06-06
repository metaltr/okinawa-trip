import { useEffect, useRef, useState } from "react";
import "./styles.css";

const STORAGE_KEY = "okinawa-days-move-v1";
const EXPENSE_KEY = "okinawa-expenses-v2";
const JOURNAL_KEY = "okinawa-journals-v1";
const PACKING_KEY = "okinawa-packing-v1";

type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  emoji: string;
  done?: boolean;
  memo?: string;
};

type MoveItem = {
  id: string;
  from: string;
  to: string;
  duration?: string;
  memo?: string;
};

type ExpenseItem = {
  id: string;
  title: string;
  amount: number;
  emoji: string;
};

type JournalItem = {
  id: string;
  title: string;
  memo: string;
  emoji: string;
  createdAt: string;
  photos?: string[];
};

type PackingItem = {
  id: string;
  title: string;
  done?: boolean;
  memo?: string;
};

type Day = {
  id: string;
  label: string;
  title: string;
  date: string;
  summary: string;
  schedule: ScheduleItem[];
  moves: MoveItem[];
};

const scheduleEmojiOptions = [
  "✈️",
  "🚗",
  "🚶",
  "🚢",
  "🚠",
  "🍜",
  "🍣",
  "🍖",
  "☕",
  "🍺",
  "🍰",
  "🏨",
  "🏝️",
  "⛱️",
  "🌊",
  "🌅",
  "📸",
  "📍",
  "🌴",
  "🐠",
  "🐳",
  "🛍️",
  "🎁",
  "🎡",
  "🎯",
  "⭐",
  "❤️",
  "🔥",
  "🎉",
  "🎵",
];

const expenseEmojiOptions = [
  "💳",
  "💵",
  "💴",
  "🪙",
  "🧾",
  "🍜",
  "🍣",
  "🍖",
  "☕",
  "🍺",
  "🍰",
  "🍦",
  "🧃",
  "🥤",
  "🍱",
  "🚗",
  "⛽",
  "🅿️",
  "🚕",
  "🚌",
  "🏨",
  "🛍️",
  "🎁",
  "🎟️",
  "🧴",
  "💊",
  "🧺",
  "📱",
  "🔌",
  "⭐",
];

const journalEmojiOptions = [
  "📝",
  "📸",
  "🌅",
  "🏝️",
  "🌊",
  "☕",
  "🍜",
  "🍺",
  "🛍️",
  "🎁",
  "❤️",
  "⭐",
  "🔥",
  "🎉",
  "😎",
  "🥹",
  "😍",
  "😴",
  "🚗",
  "✈️",
  "🌴",
  "🐠",
  "🎵",
  "📍",
  "🗺️",
];

const defaultDays: Day[] = [
  {
    id: "day1",
    label: "DAY 1",
    title: "도착 · 차탄 적응",
    date: "8/24 (월)",
    summary: "나하공항 도착, 렌터카 수령, 차탄 이동",
    schedule: [
      { id: "d1-1", time: "09:05", title: "나하공항 도착", emoji: "✈️" },
      { id: "d1-2", time: "10:30", title: "렌터카 수령", emoji: "🚗" },
      { id: "d1-3", time: "12:00", title: "Jaagaru Soba", emoji: "🍜" },
      { id: "d1-4", time: "14:00", title: "아메리칸빌리지", emoji: "🛍️" },
      { id: "d1-5", time: "18:30", title: "선셋비치", emoji: "🌅" },
    ],
    moves: [
      { id: "m1-1", from: "나하공항", to: "Jaagaru Soba" },
      { id: "m1-2", from: "Jaagaru Soba", to: "차탄" },
    ],
  },
  {
    id: "day2",
    label: "DAY 2",
    title: "북부 · 코우리 선셋",
    date: "8/25 (화)",
    summary: "만좌모, 츄라우미, 코우리섬",
    schedule: [
      { id: "d2-1", time: "09:00", title: "차탄 출발", emoji: "🚗" },
      { id: "d2-2", time: "10:00", title: "만좌모", emoji: "📍" },
      { id: "d2-3", time: "11:50", title: "츄라우미 수족관", emoji: "🐠" },
      { id: "d2-4", time: "15:50", title: "코우리섬", emoji: "🏝️" },
      { id: "d2-5", time: "18:40", title: "코우리 선셋", emoji: "🌅" },
    ],
    moves: [
      { id: "m2-1", from: "차탄", to: "만좌모" },
      { id: "m2-2", from: "만좌모", to: "츄라우미 수족관" },
      { id: "m2-3", from: "츄라우미 수족관", to: "코우리섬" },
    ],
  },
  {
    id: "day3",
    label: "DAY 3",
    title: "차탄 여유 · 나하 이동",
    date: "8/26 (수)",
    summary: "차탄에서 여유 있게 보내고 나하 이동",
    schedule: [
      { id: "d3-1", time: "09:00", title: "차탄 산책", emoji: "🚶" },
      { id: "d3-2", time: "10:30", title: "브런치", emoji: "☕" },
      { id: "d3-3", time: "12:00", title: "나하 이동", emoji: "🚗" },
      { id: "d3-4", time: "15:30", title: "국제거리", emoji: "🛍️" },
    ],
    moves: [
      { id: "m3-1", from: "차탄", to: "나하" },
      { id: "m3-2", from: "나하 숙소", to: "국제거리" },
    ],
  },
  {
    id: "day4",
    label: "DAY 4",
    title: "세나가지마 · 마지막 나하",
    date: "8/27 (목)",
    summary: "마지막 쇼핑과 자유일정",
    schedule: [
      { id: "d4-1", time: "09:30", title: "느긋한 아침", emoji: "☕" },
      { id: "d4-2", time: "11:00", title: "세나가지마", emoji: "🌊" },
      { id: "d4-3", time: "14:30", title: "국제거리 쇼핑", emoji: "🎁" },
      { id: "d4-4", time: "20:30", title: "짐 정리", emoji: "🏨" },
    ],
    moves: [
      { id: "m4-1", from: "나하", to: "세나가지마" },
      { id: "m4-2", from: "세나가지마", to: "국제거리" },
    ],
  },
  {
    id: "day5",
    label: "DAY 5",
    title: "귀국",
    date: "8/28 (금)",
    summary: "렌터카 반납 후 귀국",
    schedule: [
      { id: "d5-1", time: "08:00", title: "렌터카 반납", emoji: "🚗" },
      { id: "d5-2", time: "09:50", title: "나하공항 출발", emoji: "✈️" },
      { id: "d5-3", time: "12:00", title: "청주공항 도착", emoji: "✈️" },
    ],
    moves: [
      { id: "m5-1", from: "숙소", to: "렌터카 반납" },
      { id: "m5-2", from: "렌터카 반납", to: "나하공항" },
    ],
  },
];

const defaultPackingItems: PackingItem[] = [
  { id: "pack-1", title: "여권", done: false, memo: "" },
  {
    id: "pack-2",
    title: "국제운전면허증",
    done: false,
    memo: "렌터카 이용 시 확인",
  },
  { id: "pack-3", title: "국내 운전면허증", done: false, memo: "" },
  { id: "pack-4", title: "항공권 / 예약 확인", done: false, memo: "" },
  { id: "pack-5", title: "충전기", done: false, memo: "" },
  { id: "pack-6", title: "보조배터리", done: false, memo: "" },
  { id: "pack-7", title: "멀티어댑터", done: false, memo: "" },
  { id: "pack-8", title: "상비약", done: false, memo: "" },
  { id: "pack-9", title: "선글라스", done: false, memo: "" },
  { id: "pack-10", title: "수영복", done: false, memo: "" },
  { id: "pack-11", title: "세면도구", done: false, memo: "" },
  { id: "pack-12", title: "우산 / 우비", done: false, memo: "" },
];

export default function App() {
  const [days, setDays] = useState<Day[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultDays;
  });

  const [expenses, setExpenses] = useState<Record<string, ExpenseItem[]>>(
    () => {
      const saved = localStorage.getItem(EXPENSE_KEY);
      return saved ? JSON.parse(saved) : {};
    }
  );

  const [journals, setJournals] = useState<Record<string, JournalItem[]>>(
    () => {
      const saved = localStorage.getItem(JOURNAL_KEY);
      return saved ? JSON.parse(saved) : {};
    }
  );

  const [packingItems, setPackingItems] = useState<PackingItem[]>(() => {
    const saved = localStorage.getItem(PACKING_KEY);
    return saved ? JSON.parse(saved) : defaultPackingItems;
  });

  const [tab, setTab] = useState("today");
  const [dayId, setDayId] = useState(days[0].id);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [expenseEditingId, setExpenseEditingId] = useState<string | null>(null);
  const [journalEditingId, setJournalEditingId] = useState<string | null>(null);
  const [moveEditingId, setMoveEditingId] = useState<string | null>(null);
  const [packingEditingId, setPackingEditingId] = useState<string | null>(null);

  const [menuId, setMenuId] = useState<string | null>(null);
  const [expenseMenuId, setExpenseMenuId] = useState<string | null>(null);
  const [journalMenuId, setJournalMenuId] = useState<string | null>(null);
  const [moveMenuId, setMoveMenuId] = useState<string | null>(null);
  const [packingMenuId, setPackingMenuId] = useState<string | null>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const backupFileRef = useRef<HTMLInputElement>(null);
  const [backupPanelOpen, setBackupPanelOpen] = useState(false);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  );
  const [scheduleSearch, setScheduleSearch] = useState("");

  const [draft, setDraft] = useState({
    time: "",
    title: "",
    emoji: "⭐",
    memo: "",
  });
  const [expenseDraft, setExpenseDraft] = useState({
    title: "",
    amount: "",
    emoji: "💳",
  });
  const [journalDraft, setJournalDraft] = useState({
    title: "",
    memo: "",
    emoji: "📝",
    photos: [] as string[],
  });
  const [moveDraft, setMoveDraft] = useState({
    from: "",
    to: "",
    duration: "",
    memo: "",
  });
  const [packingDraft, setPackingDraft] = useState({
    title: "",
    memo: "",
  });
  const [dayInfoEditing, setDayInfoEditing] = useState(false);
  const [dayDraft, setDayDraft] = useState({ title: "", summary: "" });
  const [photoViewer, setPhotoViewer] = useState<string | null>(null);
  const [journalView, setJournalView] = useState<"records" | "gallery">(
    "records"
  );
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(
    null
  );

  const day = days.find((d) => d.id === dayId) || days[0];
  const selectedSchedule =
    day.schedule.find((item) => item.id === selectedScheduleId) || null;
  const scheduleSearchText = scheduleSearch.trim().toLowerCase();
  const filteredSchedules = scheduleSearchText
    ? day.schedule.filter((item) =>
        [item.time, item.title, item.memo || ""]
          .join(" ")
          .toLowerCase()
          .includes(scheduleSearchText)
      )
    : day.schedule;
  const dayExpenses = expenses[day.id] || [];
  const dayJournals = journals[day.id] || [];
  const selectedJournal =
    dayJournals.find((item) => item.id === selectedJournalId) || null;
  const getJournalPhotos = (item: JournalItem) =>
    item.photos || ((item as any).photo ? [(item as any).photo] : []);
  const dayGalleryPhotos = dayJournals.flatMap((item) =>
    getJournalPhotos(item).map((photo, index) => ({
      photo,
      index,
      journalId: item.id,
      title: item.title,
    }))
  );

  const dayExpenseTotal = dayExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const tripExpenseTotal = Object.values(expenses)
    .flat()
    .reduce((sum, item) => sum + item.amount, 0);
  const completedScheduleCount = day.schedule.filter(
    (item) => item.done
  ).length;
  const remainingScheduleCount = Math.max(
    day.schedule.length - completedScheduleCount,
    0
  );
  const nextSchedule =
    day.schedule.find((item) => !item.done) || day.schedule[0];
  const completedPackingCount = packingItems.filter((item) => item.done).length;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(journals));
  }, [journals]);

  useEffect(() => {
    localStorage.setItem(PACKING_KEY, JSON.stringify(packingItems));
  }, [packingItems]);

  useEffect(() => {
    setEditingId(null);
    setExpenseEditingId(null);
    setJournalEditingId(null);
    setMoveEditingId(null);
    setPackingEditingId(null);

    setMenuId(null);
    setExpenseMenuId(null);
    setJournalMenuId(null);
    setMoveMenuId(null);
    setPackingMenuId(null);

    setDraft({ time: "", title: "", emoji: "⭐", memo: "" });
    setExpenseDraft({ title: "", amount: "", emoji: "💳" });
    setJournalDraft({ title: "", memo: "", emoji: "📝", photos: [] });
    setMoveDraft({ from: "", to: "", duration: "", memo: "" });
    setPackingDraft({ title: "", memo: "" });
    setDayInfoEditing(false);
    setDayDraft({ title: "", summary: "" });
    setSelectedScheduleId(null);
    setScheduleSearch("");
    setSelectedJournalId(null);
    setJournalView("records");
    setBackupPanelOpen(false);
    window.scrollTo(0, 0);
  }, [tab, dayId]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest(".menu-wrap")) return;

      setMenuId(null);
      setExpenseMenuId(null);
      setJournalMenuId(null);
      setMoveMenuId(null);
      setPackingMenuId(null);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const updateDay = (partial: Partial<Day>) => {
    setDays((prev) =>
      prev.map((d) => (d.id === day.id ? { ...d, ...partial } : d))
    );
  };

  const updateSchedule = (schedule: ScheduleItem[]) => updateDay({ schedule });
  const updateMoves = (moves: MoveItem[]) => updateDay({ moves });

  const startDayInfoEdit = () => {
    setMenuId(null);
    setDayInfoEditing(true);
    setDayDraft({ title: day.title, summary: day.summary });
  };

  const saveDayInfo = () => {
    const nextTitle = dayDraft.title.trim() || day.title;
    const nextSummary = dayDraft.summary.trim() || day.summary;

    updateDay({ title: nextTitle, summary: nextSummary });
    setDayInfoEditing(false);
  };

  const exportBackup = () => {
    const backup = {
      app: "okinawa-trip-app",
      version: 1,
      exportedAt: new Date().toISOString(),
      days,
      expenses,
      journals,
      packingItems,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateText = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `okinawa-backup-${dateText}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file?: File) => {
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data.days)) {
        window.alert("올바른 오키나와 앱 백업 파일이 아닙니다.");
        return;
      }

      if (!window.confirm("현재 앱 데이터를 백업 파일 내용으로 교체할까요?")) {
        return;
      }

      setDays(data.days);
      setExpenses(data.expenses || {});
      setJournals(data.journals || {});
      setPackingItems(data.packingItems || defaultPackingItems);
      setDayId(data.days[0]?.id || "day1");
      setTab("today");
      setBackupPanelOpen(false);
      setSelectedJournalId(null);
      window.alert("백업 파일을 불러왔습니다.");
    } catch {
      window.alert("백업 파일을 불러오지 못했습니다.");
    } finally {
      if (backupFileRef.current) backupFileRef.current.value = "";
    }
  };

  const resetAllData = () => {
    if (
      !window.confirm("모든 일정, 이동, 지출, 기록을 초기 상태로 되돌릴까요?")
    ) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPENSE_KEY);
    localStorage.removeItem(JOURNAL_KEY);
    localStorage.removeItem(PACKING_KEY);

    setDays(defaultDays);
    setExpenses({});
    setJournals({});
    setPackingItems(defaultPackingItems);
    setDayId(defaultDays[0].id);
    setTab("today");
    setBackupPanelOpen(false);
    setSelectedJournalId(null);
    window.alert("초기 상태로 되돌렸습니다.");
  };

  const startAdd = () => {
    setSelectedScheduleId(null);
    setEditingId("new");
    setMenuId(null);
    setDraft({ time: "", title: "", emoji: "⭐", memo: "" });
  };

  const startEdit = (item: ScheduleItem) => {
    setSelectedScheduleId(null);
    setEditingId(item.id);
    setMenuId(null);
    setDraft({
      time: item.time,
      title: item.title,
      emoji: item.emoji,
      memo: item.memo || "",
    });
  };

  const saveSchedule = () => {
    if (!draft.time.trim() || !draft.title.trim()) return;

    if (editingId === "new") {
      updateSchedule([
        ...day.schedule,
        {
          id: `${day.id}-${Date.now()}`,
          time: draft.time,
          title: draft.title,
          emoji: draft.emoji,
          memo: draft.memo,
        },
      ]);
    } else {
      updateSchedule(
        day.schedule.map((item) =>
          item.id === editingId
            ? {
                ...item,
                time: draft.time,
                title: draft.title,
                emoji: draft.emoji,
                memo: draft.memo,
              }
            : item
        )
      );
    }

    setEditingId(null);
    setDraft({ time: "", title: "", emoji: "⭐", memo: "" });
  };

  const deleteSchedule = (id: string) => {
    if (!window.confirm("이 일정을 삭제할까요?")) return;
    updateSchedule(day.schedule.filter((item) => item.id !== id));
    if (selectedScheduleId === id) setSelectedScheduleId(null);
    setMenuId(null);
  };

  const toggleScheduleDone = (id: string) => {
    updateSchedule(
      day.schedule.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const dropSchedule = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const next = [...day.schedule];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    updateSchedule(next);
    setDragIndex(null);
  };

  const startMoveAdd = () => {
    setMoveEditingId("new");
    setMoveMenuId(null);
    setMoveDraft({ from: "", to: "", duration: "", memo: "" });
  };

  const startMoveEdit = (item: MoveItem) => {
    setMoveEditingId(item.id);
    setMoveMenuId(null);
    setMoveDraft({
      from: item.from,
      to: item.to,
      duration: item.duration || "",
      memo: item.memo || "",
    });
  };

  const saveMove = () => {
    if (!moveDraft.from.trim() || !moveDraft.to.trim()) return;

    if (moveEditingId === "new") {
      updateMoves([
        ...day.moves,
        {
          id: `${day.id}-move-${Date.now()}`,
          from: moveDraft.from,
          to: moveDraft.to,
          duration: moveDraft.duration,
          memo: moveDraft.memo,
        },
      ]);
    } else {
      updateMoves(
        day.moves.map((item) =>
          item.id === moveEditingId
            ? {
                ...item,
                from: moveDraft.from,
                to: moveDraft.to,
                duration: moveDraft.duration,
                memo: moveDraft.memo,
              }
            : item
        )
      );
    }

    setMoveEditingId(null);
    setMoveDraft({ from: "", to: "", duration: "", memo: "" });
  };

  const deleteMove = (id: string) => {
    if (!window.confirm("이 이동 구간을 삭제할까요?")) return;
    updateMoves(day.moves.filter((item) => item.id !== id));
    setMoveMenuId(null);
  };

  const googleMapsUrl = (move: MoveItem) => {
    return `https://www.google.com/maps/search/${encodeURIComponent(
      `${move.from} to ${move.to} Okinawa`
    )}`;
  };

  const openGoogleMaps = (move: MoveItem) => {
    const opened = window.open(
      googleMapsUrl(move),
      "_blank",
      "noopener,noreferrer"
    );
    if (!opened) {
      copyText(
        googleMapsUrl(move),
        "새 창이 차단되어 구글맵 링크를 복사했습니다."
      );
    }
  };

  const copyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      window.alert(message);
    } catch {
      window.prompt("복사해서 사용하세요.", text);
    }
  };

  const startPackingAdd = () => {
    setPackingEditingId("new");
    setPackingMenuId(null);
    setPackingDraft({ title: "", memo: "" });
  };

  const startPackingEdit = (item: PackingItem) => {
    setPackingEditingId(item.id);
    setPackingMenuId(null);
    setPackingDraft({ title: item.title, memo: item.memo || "" });
  };

  const savePackingItem = () => {
    if (!packingDraft.title.trim()) return;

    if (packingEditingId === "new") {
      setPackingItems([
        {
          id: `pack-${Date.now()}`,
          title: packingDraft.title,
          memo: packingDraft.memo,
          done: false,
        },
        ...packingItems,
      ]);
    } else {
      setPackingItems(
        packingItems.map((item) =>
          item.id === packingEditingId
            ? { ...item, title: packingDraft.title, memo: packingDraft.memo }
            : item
        )
      );
    }

    setPackingEditingId(null);
    setPackingDraft({ title: "", memo: "" });
  };

  const togglePackingDone = (id: string) => {
    setPackingItems(
      packingItems.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const deletePackingItem = (id: string) => {
    if (!window.confirm("이 준비물을 삭제할까요?")) return;
    setPackingItems(packingItems.filter((item) => item.id !== id));
    setPackingMenuId(null);
  };

  const startExpenseAdd = () => {
    setExpenseEditingId("new");
    setExpenseMenuId(null);
    setExpenseDraft({ title: "", amount: "", emoji: "💳" });
  };

  const startExpenseEdit = (item: ExpenseItem) => {
    setExpenseEditingId(item.id);
    setExpenseMenuId(null);
    setExpenseDraft({
      title: item.title,
      amount: String(item.amount),
      emoji: item.emoji,
    });
  };

  const saveExpense = () => {
    const amount = Number(expenseDraft.amount.replace(/[^0-9]/g, ""));
    if (!expenseDraft.title.trim() || !amount) return;

    const current = expenses[day.id] || [];

    if (expenseEditingId === "new") {
      setExpenses({
        ...expenses,
        [day.id]: [
          {
            id: `${day.id}-expense-${Date.now()}`,
            title: expenseDraft.title,
            amount,
            emoji: expenseDraft.emoji,
          },
          ...current,
        ],
      });
    } else {
      setExpenses({
        ...expenses,
        [day.id]: current.map((item) =>
          item.id === expenseEditingId
            ? {
                ...item,
                title: expenseDraft.title,
                amount,
                emoji: expenseDraft.emoji,
              }
            : item
        ),
      });
    }

    setExpenseEditingId(null);
    setExpenseDraft({ title: "", amount: "", emoji: "💳" });
  };

  const deleteExpense = (id: string) => {
    if (!window.confirm("이 지출을 삭제할까요?")) return;
    setExpenses({
      ...expenses,
      [day.id]: dayExpenses.filter((item) => item.id !== id),
    });
    setExpenseMenuId(null);
  };

  const startJournalAdd = () => {
    setSelectedJournalId(null);
    setJournalView("records");
    setJournalEditingId("new");
    setJournalMenuId(null);
    setJournalDraft({ title: "", memo: "", emoji: "📝", photos: [] });
  };

  const startJournalEdit = (item: JournalItem) => {
    setSelectedJournalId(null);
    setJournalView("records");
    setJournalEditingId(item.id);
    setJournalMenuId(null);
    setJournalDraft({
      title: item.title,
      memo: item.memo,
      emoji: item.emoji,
      photos: getJournalPhotos(item),
    });
  };

  const saveJournal = () => {
    if (
      !journalDraft.title.trim() &&
      !journalDraft.memo.trim() &&
      journalDraft.photos.length === 0
    )
      return;

    const current = journals[day.id] || [];
    const now = new Date().toLocaleString("ko-KR");

    if (journalEditingId === "new") {
      setJournals({
        ...journals,
        [day.id]: [
          {
            id: `${day.id}-journal-${Date.now()}`,
            title: journalDraft.title.trim() || "제목 없는 기록",
            memo: journalDraft.memo,
            emoji: journalDraft.emoji,
            photos: journalDraft.photos,
            createdAt: now,
          },
          ...current,
        ],
      });
    } else {
      setJournals({
        ...journals,
        [day.id]: current.map((item) =>
          item.id === journalEditingId
            ? {
                ...item,
                title: journalDraft.title || "제목 없는 기록",
                memo: journalDraft.memo,
                emoji: journalDraft.emoji,
                photos: journalDraft.photos,
              }
            : item
        ),
      });
    }

    setJournalEditingId(null);
    setJournalDraft({ title: "", memo: "", emoji: "📝", photos: [] });
  };

  const deleteJournal = (id: string) => {
    if (!window.confirm("이 기록을 삭제할까요?")) return;
    setJournals({
      ...journals,
      [day.id]: dayJournals.filter((item) => item.id !== id),
    });
    if (selectedJournalId === id) setSelectedJournalId(null);
    setJournalMenuId(null);
  };

  const handleJournalPhotos = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentPhotos = journalDraft.photos || [];
    const remainingSlots = 5 - currentPhotos.length;

    if (remainingSlots <= 0) {
      window.alert("사진은 기록당 최대 5장까지 첨부할 수 있습니다.");
      return;
    }

    const selectedFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingSlots);

    if (selectedFiles.length === 0) {
      window.alert("이미지 파일만 첨부할 수 있습니다.");
      return;
    }

    try {
      const photos = await Promise.all(
        selectedFiles.map((file) => resizeImage(file, 900, 0.72))
      );
      setJournalDraft({
        ...journalDraft,
        photos: [...currentPhotos, ...photos],
      });
    } catch {
      window.alert("사진을 불러오지 못했습니다.");
    }
  };

  const removeJournalDraftPhoto = (index: number) => {
    setJournalDraft({
      ...journalDraft,
      photos: journalDraft.photos.filter(
        (_, photoIndex) => photoIndex !== index
      ),
    });
  };

  const openJournalFromGallery = (journalId: string) => {
    setJournalView("records");
    setSelectedJournalId(journalId);
  };

  return (
    <main className="app" ref={appRef}>
      <header className="hero">
        <div className="eyebrow">2026.08.24 - 08.28</div>
        <h1>오키나와 4박 5일</h1>
        <p>일정 · 이동 · 지출 · 기록을 한 번에 관리하는 여행앱</p>
      </header>

      <section className="day-tabs">
        {days.map((d) => (
          <button
            key={d.id}
            className={day.id === d.id ? "active" : ""}
            onClick={() => setDayId(d.id)}
          >
            <strong>{d.label}</strong>
            <span>{d.date}</span>
          </button>
        ))}
      </section>

      <section className="card">
        {tab === "today" && (
          <>
            <div className="today-dashboard">
              <div className="today-menu-wrap menu-wrap">
                <button
                  className="today-dot-btn"
                  onClick={() =>
                    setMenuId(menuId === "day-info" ? null : "day-info")
                  }
                >
                  ⋮
                </button>

                {menuId === "day-info" && (
                  <div className="popup-menu today-popup-menu">
                    <button onClick={startDayInfoEdit}>수정</button>
                    <button
                      onClick={() => {
                        setMenuId(null);
                        setBackupPanelOpen(true);
                      }}
                    >
                      백업
                    </button>
                  </div>
                )}
              </div>

              <div className="today-label">{day.label}</div>
              <h2>{day.title}</h2>
              <p>
                {day.date} · {day.summary}
              </p>
            </div>

            {dayInfoEditing && (
              <div className="edit-box day-info-box">
                <input
                  value={dayDraft.title}
                  onChange={(e) =>
                    setDayDraft({ ...dayDraft, title: e.target.value })
                  }
                  placeholder="예: 오키나와 첫날"
                />
                <input
                  value={dayDraft.summary}
                  onChange={(e) =>
                    setDayDraft({ ...dayDraft, summary: e.target.value })
                  }
                  placeholder="예: 공항 도착 후 차탄에서 가볍게 적응"
                />
                <div className="action-row">
                  <button onClick={saveDayInfo}>저장</button>
                  <button onClick={() => setDayInfoEditing(false)}>취소</button>
                </div>
              </div>
            )}

            {backupPanelOpen && (
              <div className="edit-box backup-box">
                <div className="backup-head">
                  <b>데이터 백업</b>
                  <button onClick={() => setBackupPanelOpen(false)}>
                    닫기
                  </button>
                </div>
                <p>
                  일정, 이동, 지출, 기록을 JSON 파일로 저장하거나 다시
                  불러옵니다. 사진이 많으면 백업 파일 용량이 커질 수 있습니다.
                </p>

                <input
                  ref={backupFileRef}
                  type="file"
                  accept="application/json"
                  style={{ display: "none" }}
                  onChange={(e) => importBackup(e.target.files?.[0])}
                />

                <div className="backup-actions">
                  <button onClick={exportBackup}>내보내기</button>
                  <button onClick={() => backupFileRef.current?.click()}>
                    가져오기
                  </button>
                  <button className="danger-btn" onClick={resetAllData}>
                    초기화
                  </button>
                </div>
              </div>
            )}

            <div className="today-next-card">
              <div>
                <small>다음 일정</small>
                <b>
                  {nextSchedule
                    ? `${nextSchedule.emoji} ${nextSchedule.title}`
                    : "남은 일정 없음"}
                </b>
              </div>
              <strong>{nextSchedule?.time || "완료"}</strong>
            </div>

            <div className="today-stats-grid">
              <div className="today-stat done-stat">
                <span>완료</span>
                <b>{completedScheduleCount}</b>
              </div>
              <div className="today-stat remain-stat">
                <span>남음</span>
                <b>{remainingScheduleCount}</b>
              </div>
              <div className="today-stat">
                <span>이동</span>
                <b>{day.moves.length}</b>
              </div>
              <div className="today-stat">
                <span>기록</span>
                <b>{dayJournals.length}</b>
              </div>
            </div>

            <div className="today-money-row">
              <div>
                <small>오늘 지출</small>
                <b>{dayExpenseTotal.toLocaleString()}원</b>
              </div>
              <div>
                <small>전체 지출</small>
                <b>{tripExpenseTotal.toLocaleString()}원</b>
              </div>
            </div>
          </>
        )}

        {tab === "schedule" && (
          <>
            <div className="tab-head">
              <h2>일정</h2>
            </div>

            <button className="primary" onClick={startAdd}>
              + 일정 추가
            </button>

            <div className="schedule-search-box">
              <input
                value={scheduleSearch}
                onChange={(e) => {
                  setScheduleSearch(e.target.value);
                  setSelectedScheduleId(null);
                }}
                placeholder="일정 검색: 숙소, 예약번호, 주차, 식당"
              />
              {scheduleSearch && (
                <button onClick={() => setScheduleSearch("")}>초기화</button>
              )}
            </div>

            {scheduleSearch && !selectedSchedule && (
              <div className="search-result-label">
                검색 결과 {filteredSchedules.length}개
              </div>
            )}

            {editingId && (
              <EditorBox
                time={draft.time}
                title={draft.title}
                emoji={draft.emoji}
                emojiOptions={scheduleEmojiOptions}
                setTime={(time: string) => setDraft({ ...draft, time })}
                setTitle={(title: string) => setDraft({ ...draft, title })}
                setEmoji={(emoji: string) => setDraft({ ...draft, emoji })}
                memo={draft.memo}
                setMemo={(memo: string) => setDraft({ ...draft, memo })}
                memoPlaceholder="메모 예: 예약번호, 주소, 주차, 확인사항"
                save={saveSchedule}
                cancel={() => setEditingId(null)}
                titlePlaceholder="일정명 입력"
                amountMode={false}
              />
            )}

            {selectedSchedule ? (
              <div className="schedule-detail">
                <button
                  className="back-btn"
                  onClick={() => setSelectedScheduleId(null)}
                >
                  ← 일정 목록
                </button>

                <div className="schedule-detail-head">
                  <div className="schedule-detail-icon">
                    {selectedSchedule.emoji}
                  </div>
                  <div>
                    <small>{selectedSchedule.time}</small>
                    <h3>{selectedSchedule.title}</h3>
                  </div>
                  <MenuButton
                    id={selectedSchedule.id}
                    openId={menuId}
                    setOpenId={setMenuId}
                    onEdit={() => startEdit(selectedSchedule)}
                    onDelete={() => deleteSchedule(selectedSchedule.id)}
                  />
                </div>

                <button
                  className={
                    selectedSchedule.done
                      ? "detail-check checked"
                      : "detail-check"
                  }
                  onClick={() => toggleScheduleDone(selectedSchedule.id)}
                >
                  {selectedSchedule.done ? "완료한 일정" : "아직 완료 전"}
                </button>

                <div className="schedule-detail-memo">
                  <small>메모</small>
                  <p>{selectedSchedule.memo || "등록된 메모가 없습니다."}</p>
                </div>
              </div>
            ) : filteredSchedules.length === 0 ? (
              <div className="empty-box">검색 결과가 없습니다.</div>
            ) : (
              filteredSchedules.map((item, index) => (
                <div
                  key={item.id}
                  className={`${
                    dragIndex === index
                      ? "schedule-card dragging"
                      : "schedule-card"
                  }${item.done ? " done" : ""}`}
                  onClick={() => setSelectedScheduleId(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dropSchedule(index)}
                >
                  <button
                    className={item.done ? "check-btn checked" : "check-btn"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleScheduleDone(item.id);
                    }}
                    aria-label="일정 완료"
                  >
                    ✓
                  </button>
                  <div
                    className="drag-handle"
                    draggable
                    onClick={(e) => e.stopPropagation()}
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                  >
                    ☰
                  </div>
                  <div className="type-icon">{item.emoji}</div>
                  <div className="time-badge">{item.time}</div>
                  <div className="schedule-main">
                    <b>{item.title}</b>
                    {item.memo && (
                      <em className="schedule-memo">{item.memo}</em>
                    )}
                  </div>
                  <MenuButton
                    id={item.id}
                    openId={menuId}
                    setOpenId={setMenuId}
                    onEdit={() => startEdit(item)}
                    onDelete={() => deleteSchedule(item.id)}
                  />
                </div>
              ))
            )}
          </>
        )}

        {tab === "move" && (
          <>
            <div className="tab-head">
              <h2>이동</h2>
            </div>

            <button className="primary" onClick={startMoveAdd}>
              + 이동 구간 추가
            </button>

            {moveEditingId && (
              <div className="edit-box">
                <input
                  value={moveDraft.from}
                  onChange={(e) =>
                    setMoveDraft({ ...moveDraft, from: e.target.value })
                  }
                  placeholder="출발지 입력"
                />
                <input
                  value={moveDraft.to}
                  onChange={(e) =>
                    setMoveDraft({ ...moveDraft, to: e.target.value })
                  }
                  placeholder="도착지 입력"
                />
                <input
                  value={moveDraft.duration}
                  onChange={(e) =>
                    setMoveDraft({ ...moveDraft, duration: e.target.value })
                  }
                  placeholder="예상 이동시간 예: 45분"
                />
                <input
                  value={moveDraft.memo}
                  onChange={(e) =>
                    setMoveDraft({ ...moveDraft, memo: e.target.value })
                  }
                  placeholder="메모 예: 주차장 확인"
                />
                <div className="action-row">
                  <button onClick={saveMove}>저장</button>
                  <button onClick={() => setMoveEditingId(null)}>취소</button>
                </div>
              </div>
            )}

            {day.moves.length === 0 ? (
              <div className="empty-box">아직 등록한 이동 구간이 없습니다.</div>
            ) : (
              day.moves.map((move, index) => (
                <div className="expense-card" key={move.id}>
                  <div className="type-icon">{index + 1}</div>
                  <div className="expense-main">
                    <b>{move.from}</b>
                    <small>→ {move.to}</small>
                    {(move.duration || move.memo) && (
                      <div className="move-meta">
                        {move.duration && <span>{move.duration}</span>}
                        {move.memo && <em>{move.memo}</em>}
                      </div>
                    )}
                  </div>

                  <RouteMenuButton
                    id={move.id}
                    openId={moveMenuId}
                    setOpenId={setMoveMenuId}
                    onOpen={() => openGoogleMaps(move)}
                    onCopyLink={() =>
                      copyText(
                        googleMapsUrl(move),
                        "구글맵 링크를 복사했습니다."
                      )
                    }
                    onCopyRoute={() =>
                      copyText(
                        `${move.from} → ${move.to}`,
                        "이동 경로명을 복사했습니다."
                      )
                    }
                    onEdit={() => startMoveEdit(move)}
                    onDelete={() => deleteMove(move.id)}
                  />
                </div>
              ))
            )}
          </>
        )}

        {tab === "packing" && (
          <>
            <div className="tab-head">
              <h2>준비물</h2>
            </div>

            <div className="packing-summary">
              <div>
                <small>완료</small>
                <b>{completedPackingCount}</b>
              </div>
              <div>
                <small>전체</small>
                <b>{packingItems.length}</b>
              </div>
            </div>

            <button className="primary" onClick={startPackingAdd}>
              + 준비물 추가
            </button>

            {packingEditingId && (
              <div className="edit-box">
                <input
                  value={packingDraft.title}
                  onChange={(e) =>
                    setPackingDraft({ ...packingDraft, title: e.target.value })
                  }
                  placeholder="준비물 이름 예: 여권"
                />
                <input
                  value={packingDraft.memo}
                  onChange={(e) =>
                    setPackingDraft({ ...packingDraft, memo: e.target.value })
                  }
                  placeholder="메모 예: 렌터카 이용 시 필요"
                />
                <div className="action-row">
                  <button onClick={savePackingItem}>저장</button>
                  <button onClick={() => setPackingEditingId(null)}>
                    취소
                  </button>
                </div>
              </div>
            )}

            {packingItems.length === 0 ? (
              <div className="empty-box">아직 등록한 준비물이 없습니다.</div>
            ) : (
              packingItems.map((item) => (
                <div
                  className={item.done ? "packing-card done" : "packing-card"}
                  key={item.id}
                >
                  <button
                    className={item.done ? "check-btn checked" : "check-btn"}
                    onClick={() => togglePackingDone(item.id)}
                    aria-label="준비물 체크"
                  >
                    ✓
                  </button>
                  <div className="packing-main">
                    <b>{item.title}</b>
                    {item.memo && <small>{item.memo}</small>}
                  </div>
                  <MenuButton
                    id={item.id}
                    openId={packingMenuId}
                    setOpenId={setPackingMenuId}
                    onEdit={() => startPackingEdit(item)}
                    onDelete={() => deletePackingItem(item.id)}
                  />
                </div>
              ))
            )}
          </>
        )}

        {tab === "budget" && (
          <>
            <div className="tab-head">
              <h2>지출</h2>
            </div>

            <div className="expense-summary">
              <div>
                <small>오늘 지출</small>
                <b>{dayExpenseTotal.toLocaleString()}원</b>
              </div>
              <div>
                <small>전체 지출</small>
                <b>{tripExpenseTotal.toLocaleString()}원</b>
              </div>
            </div>

            <button className="primary" onClick={startExpenseAdd}>
              + 지출 추가
            </button>

            {expenseEditingId && (
              <EditorBox
                time={expenseDraft.amount}
                title={expenseDraft.title}
                emoji={expenseDraft.emoji}
                emojiOptions={expenseEmojiOptions}
                setTime={(amount: string) =>
                  setExpenseDraft({ ...expenseDraft, amount })
                }
                setTitle={(title: string) =>
                  setExpenseDraft({ ...expenseDraft, title })
                }
                setEmoji={(emoji: string) =>
                  setExpenseDraft({ ...expenseDraft, emoji })
                }
                save={saveExpense}
                cancel={() => setExpenseEditingId(null)}
                titlePlaceholder="지출 항목 입력"
                amountMode
              />
            )}

            {dayExpenses.length === 0 ? (
              <div className="empty-box">아직 입력한 지출이 없습니다.</div>
            ) : (
              dayExpenses.map((item) => (
                <div className="expense-card" key={item.id}>
                  <div className="type-icon">{item.emoji}</div>
                  <div className="expense-main">
                    <b>{item.title}</b>
                    <small>{item.amount.toLocaleString()}원</small>
                  </div>
                  <MenuButton
                    id={item.id}
                    openId={expenseMenuId}
                    setOpenId={setExpenseMenuId}
                    onEdit={() => startExpenseEdit(item)}
                    onDelete={() => deleteExpense(item.id)}
                  />
                </div>
              ))
            )}
          </>
        )}

        {tab === "journal" && (
          <>
            <div className="tab-head">
              <h2>기록</h2>
            </div>

            <button className="primary" onClick={startJournalAdd}>
              + 기록 추가
            </button>

            <div className="journal-view-tabs">
              <button
                className={journalView === "records" ? "active" : ""}
                onClick={() => {
                  setJournalView("records");
                  setSelectedJournalId(null);
                }}
              >
                기록
              </button>
              <button
                className={journalView === "gallery" ? "active" : ""}
                onClick={() => {
                  setJournalView("gallery");
                  setSelectedJournalId(null);
                }}
              >
                갤러리
              </button>
            </div>

            {journalEditingId && (
              <div className="edit-box">
                <input
                  value={journalDraft.title}
                  onChange={(e) =>
                    setJournalDraft({ ...journalDraft, title: e.target.value })
                  }
                  placeholder="기록 제목"
                />
                <textarea
                  value={journalDraft.memo}
                  onChange={(e) =>
                    setJournalDraft({ ...journalDraft, memo: e.target.value })
                  }
                  placeholder="오늘의 여행 기록을 남겨보세요."
                />

                <div className="photo-box">
                  <label className="photo-upload">
                    📷 사진 추가 {journalDraft.photos.length}/5
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        handleJournalPhotos(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  {journalDraft.photos.length > 0 && (
                    <div className="photo-preview-grid">
                      {journalDraft.photos.map((photo, index) => (
                        <div
                          className="photo-preview-tile"
                          key={`${photo}-${index}`}
                        >
                          <img
                            src={photo}
                            alt={`기록 사진 미리보기 ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeJournalDraftPhoto(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="emoji-current">
                  <span>선택한 아이콘</span>
                  <b>{journalDraft.emoji}</b>
                </div>

                <div className="emoji-panel">
                  {journalEmojiOptions.map((item) => (
                    <button
                      key={item}
                      className={
                        journalDraft.emoji === item
                          ? "emoji-btn selected"
                          : "emoji-btn"
                      }
                      onClick={() =>
                        setJournalDraft({ ...journalDraft, emoji: item })
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="action-row">
                  <button onClick={saveJournal}>저장</button>
                  <button onClick={() => setJournalEditingId(null)}>
                    취소
                  </button>
                </div>
              </div>
            )}

            {selectedJournal ? (
              <div className="journal-detail">
                <button
                  className="back-btn"
                  onClick={() => setSelectedJournalId(null)}
                >
                  ← 목록으로
                </button>

                {getJournalPhotos(selectedJournal).length > 0 ? (
                  <>
                    <img
                      className="journal-detail-photo"
                      src={getJournalPhotos(selectedJournal)[0]}
                      alt={selectedJournal.title}
                      onClick={() =>
                        setPhotoViewer(getJournalPhotos(selectedJournal)[0])
                      }
                    />
                    {getJournalPhotos(selectedJournal).length > 1 && (
                      <div className="journal-detail-photo-grid">
                        {getJournalPhotos(selectedJournal).map(
                          (photo, index) => (
                            <button
                              key={`${photo}-${index}`}
                              onClick={() => setPhotoViewer(photo)}
                            >
                              <img
                                src={photo}
                                alt={`${selectedJournal.title} ${index + 1}`}
                              />
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="journal-detail-placeholder">
                    {selectedJournal.emoji}
                  </div>
                )}

                <div className="journal-detail-head">
                  <div>
                    <small>{selectedJournal.createdAt}</small>
                    <h3>{selectedJournal.title}</h3>
                  </div>
                  <MenuButton
                    id={selectedJournal.id}
                    openId={journalMenuId}
                    setOpenId={setJournalMenuId}
                    onEdit={() => startJournalEdit(selectedJournal)}
                    onDelete={() => deleteJournal(selectedJournal.id)}
                  />
                </div>

                <p className="journal-detail-memo">
                  {selectedJournal.memo || "메모 없음"}
                </p>
              </div>
            ) : journalView === "gallery" ? (
              dayGalleryPhotos.length === 0 ? (
                <div className="empty-box">
                  아직 갤러리에 표시할 사진이 없습니다.
                </div>
              ) : (
                <div className="gallery-grid">
                  {dayGalleryPhotos.map((item) => (
                    <button
                      className="gallery-thumb"
                      key={`${item.journalId}-${item.index}`}
                      onClick={() => openJournalFromGallery(item.journalId)}
                    >
                      <img src={item.photo} alt={item.title} />
                    </button>
                  ))}
                </div>
              )
            ) : dayJournals.length === 0 ? (
              <div className="empty-box">아직 남긴 기록이 없습니다.</div>
            ) : (
              <div className="journal-grid">
                {dayJournals.map((item) => {
                  const photos = getJournalPhotos(item);
                  return (
                    <button
                      className="journal-thumb"
                      key={item.id}
                      onClick={() => setSelectedJournalId(item.id)}
                    >
                      {photos.length > 0 ? (
                        <div className="journal-thumb-photo-wrap">
                          <img src={photos[0]} alt={item.title} />
                          {photos.length > 1 && <em>{photos.length}</em>}
                        </div>
                      ) : (
                        <span>{item.emoji}</span>
                      )}
                      <b>{item.title}</b>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {photoViewer && (
        <div className="photo-modal" onClick={() => setPhotoViewer(null)}>
          <img src={photoViewer} alt="확대 사진" />
        </div>
      )}

      <nav className="bottom-nav">
        <button
          onClick={() => setTab("today")}
          className={tab === "today" ? "on" : ""}
        >
          오늘
        </button>
        <button
          onClick={() => setTab("schedule")}
          className={tab === "schedule" ? "on" : ""}
        >
          일정
        </button>
        <button
          onClick={() => setTab("move")}
          className={tab === "move" ? "on" : ""}
        >
          이동
        </button>
        <button
          onClick={() => setTab("packing")}
          className={tab === "packing" ? "on" : ""}
        >
          준비물
        </button>
        <button
          onClick={() => setTab("budget")}
          className={tab === "budget" ? "on" : ""}
        >
          지출
        </button>
        <button
          onClick={() => setTab("journal")}
          className={tab === "journal" ? "on" : ""}
        >
          기록
        </button>
      </nav>
    </main>
  );
}

function EditorBox({
  time,
  title,
  emoji,
  emojiOptions,
  setTime,
  setTitle,
  setEmoji,
  memo,
  setMemo,
  memoPlaceholder,
  save,
  cancel,
  titlePlaceholder,
  amountMode,
}: any) {
  return (
    <div className="edit-box">
      <input
        value={time}
        onChange={(e) => setTime(e.target.value)}
        placeholder={amountMode ? "금액 예: 18000" : "시간 예: 09:30"}
        inputMode={amountMode ? "numeric" : "text"}
      />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={titlePlaceholder}
      />
      {setMemo && (
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder={memoPlaceholder || "메모 입력"}
          className="memo-input"
        />
      )}
      <div className="emoji-current">
        <span>선택한 아이콘</span>
        <b>{emoji}</b>
      </div>
      <div className="emoji-panel">
        {emojiOptions.map((item: string) => (
          <button
            key={item}
            className={emoji === item ? "emoji-btn selected" : "emoji-btn"}
            onClick={() => setEmoji(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="action-row">
        <button onClick={save}>저장</button>
        <button onClick={cancel}>취소</button>
      </div>
    </div>
  );
}

function resizeImage(
  file: File,
  maxWidth: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * ratio);
        const height = Math.round(img.height * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas를 사용할 수 없습니다."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function MenuButton({ id, openId, setOpenId, onEdit, onDelete }: any) {
  return (
    <div className="menu-wrap">
      <button
        className="dot-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpenId(openId === id ? null : id);
        }}
      >
        ⋮
      </button>
      {openId === id && (
        <div className="popup-menu">
          <button onClick={onEdit}>수정</button>
          <button onClick={onDelete}>삭제</button>
        </div>
      )}
    </div>
  );
}

function RouteMenuButton({
  id,
  openId,
  setOpenId,
  onOpen,
  onCopyLink,
  onCopyRoute,
  onEdit,
  onDelete,
}: any) {
  return (
    <div className="menu-wrap">
      <button
        className="dot-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpenId(openId === id ? null : id);
        }}
      >
        ⋮
      </button>
      {openId === id && (
        <div className="popup-menu">
          <button onClick={onOpen}>지도</button>
          <button onClick={onCopyLink}>링크</button>
          <button onClick={onCopyRoute}>경로</button>
          <button onClick={onEdit}>수정</button>
          <button onClick={onDelete}>삭제</button>
        </div>
      )}
    </div>
  );
}
