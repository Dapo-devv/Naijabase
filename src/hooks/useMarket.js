import { useNaijaBase } from '../context/NaijaBaseContext';
import { todayISO } from '../utils/constants';

export function useMarket() {
  const { currentUser, updateUserData } = useNaijaBase();

  const logPrices = (items, pricesObj) => {
    const today = todayISO();
    updateUserData((d) => {
      const existingIdx = d.marketLogs.findIndex(l => l.date === today);
      let nextLogs;
      if (existingIdx >= 0) {
        nextLogs = [...d.marketLogs];
        nextLogs[existingIdx] = { date: today, prices: pricesObj };
      } else {
        nextLogs = [...d.marketLogs, { date: today, prices: pricesObj }];
      }
      return { ...d, marketLogs: nextLogs };
    });
  };

  return { marketLogs: currentUser?.data?.marketLogs || [], logPrices };
}