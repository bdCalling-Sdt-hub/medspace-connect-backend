export const getSubscriptionPeriodDates = (subscriptionDate: Date) => {
    const start = new Date(subscriptionDate);
    const end = new Date(subscriptionDate);
    end.setDate(start.getDate() + 30);
    
    return { start, end };
  };