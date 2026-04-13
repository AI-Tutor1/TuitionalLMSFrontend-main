"use client";

import React from "react";
import { useState, useMemo, useCallback } from "react";
import {
  CreditCard,
  ArrowRight,
  PieChart,
  Wallet,
  History,
  ChevronRight,
} from "lucide-react";
import classes from "./parent-billing&Payments.module.css";

// Types
interface Subscription {
  child: string;
  subjects: string[];
  grade: string;
  hours: string;
  amount: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: string;
}

interface SubjectSpending {
  subject: string;
  amount: number;
  color: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType;
  action: string;
}

// Constants moved outside component to prevent recreation
const ACCOUNT_SUMMARY = {
  totalBalance: 450.0,
  nextPaymentDate: "Feb 15, 2024",
  nextPaymentAmount: 225.0,
  subscriptions: [
    {
      child: "Emma Johnson",
      subjects: ["Mathematics", "Science"],
      grade: "Grade 8",
      hours: "4 hrs/week",
      amount: 225.0,
    },
    {
      child: "Alex Johnson",
      subjects: ["English", "History"],
      grade: "Grade 6",
      hours: "3 hrs/week",
      amount: 225.0,
    },
  ] as Subscription[],
};

const SUBJECT_SPENDING: SubjectSpending[] = [
  { subject: "Mathematics", amount: 180, color: "var(--main-blue-color)" },
  { subject: "Science", amount: 120, color: "var(--blue-color1)" },
  { subject: "English", amount: 90, color: "var(--blue-color2)" },
  { subject: "History", amount: 60, color: "var(--blue-color5)" },
];

const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    date: "Jan 15, 2024",
    description: "Monthly subscription - Emma & Alex",
    amount: -450.0,
    status: "Completed",
  },
  {
    id: "2",
    date: "Dec 15, 2023",
    description: "Monthly subscription - Emma & Alex",
    amount: -450.0,
    status: "Completed",
  },
  {
    id: "3",
    date: "Nov 15, 2023",
    description: "Monthly subscription - Alex",
    amount: -225.0,
    status: "Completed",
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Add Funds",
    description: "Add money to your account balance",
    icon: Wallet,
    action: "add-funds",
  },
  {
    title: "Payment Methods",
    description: "Manage your saved payment methods",
    icon: CreditCard,
    action: "payment-methods",
  },
  {
    title: "Transaction History",
    description: "View all your past transactions",
    icon: History,
    action: "transaction-history",
  },
];

// Optimized Pie Chart Component
const SimplePieChart = React.memo(({ data }: { data: SubjectSpending[] }) => {
  const chartData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    let cumulativePercentage = 0;

    return data.map((item, index) => {
      const percentage = (item.amount / total) * 100;
      const startAngle = (cumulativePercentage / 100) * 360 - 90;
      const angle = (percentage / 100) * 360;
      const endAngle = startAngle + angle;
      const largeArcFlag = angle > 180 ? 1 : 0;

      const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
      const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
      const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
      const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

      const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      cumulativePercentage += percentage;

      return { ...item, path, index };
    });
  }, [data]);

  return (
    <div className={classes.chartContainer}>
      <svg viewBox="0 0 100 100" className={classes.pieChart}>
        {chartData.map((item) => (
          <path
            key={`chart-${item.index}`}
            d={item.path}
            fill={item.color}
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
        <circle cx="50" cy="50" r="20" fill="white" />
      </svg>
    </div>
  );
});

SimplePieChart.displayName = "SimplePieChart";

// Reusable Components
const OverviewCard = React.memo(
  ({ label, amount }: { label: string; amount: number }) => (
    <div className={classes.overviewCardContent}>
      <p className={classes.overviewLabel}>{label}</p>
      <p className={classes.overviewValue}>${amount}</p>
    </div>
  ),
);

OverviewCard.displayName = "OverviewCard";

const SubscriptionItem = React.memo(
  ({ subscription }: { subscription: Subscription }) => (
    <div className={classes.subscriptionItem}>
      {/* <div className={classes.subscriptionDetails}>
        <h4 className={classes.subscriptionName}>{subscription.child}</h4>
        <p className={classes.subscriptionInfo}>
          {subscription.grade} • {subscription.hours}
        </p>
        <div className={classes.subjectTags}>
          {subscription.subjects.map((subject, idx) => (
            <span
              key={`${subscription.child}-${subject}-${idx}`}
              className={classes.subjectTag}
            >
              {subject}
            </span>
          ))}
        </div>
      </div> */}
      <div className={classes.subscriptionPrice}>
        <p className={classes.priceValue}>${subscription.amount}</p>
        <p className={classes.priceLabel}>pr month</p>
      </div>
    </div>
  ),
);

SubscriptionItem.displayName = "SubscriptionItem";

const TransactionItem = React.memo(
  ({ transaction }: { transaction: Transaction }) => (
    <div className={classes.transactionItem}>
      <div className={classes.transactionDetails}>
        <p className={classes.transactionDescription}>
          {transaction.description}
        </p>
        <p className={classes.transactionDate}>{transaction.date}</p>
      </div>
      <div className={classes.transactionMeta}>
        <p className={classes.transactionAmount}>
          ${Math.abs(transaction.amount)}
        </p>
        <Badge className={classes.statusBadge}>{transaction.status}</Badge>
      </div>
    </div>
  ),
);

TransactionItem.displayName = "TransactionItem";

const Badge = React.memo(
  ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={`${classes.badge} ${className}`}>{children}</span>,
);

Badge.displayName = "Badge";

const Button = React.memo(
  ({
    children,
    onClick,
    variant = "primary",
    className = "",
    size = "medium",
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "outline" | "ghost";
    className?: string;
    size?: "small" | "medium" | "large";
  }) => {
    const variantClass =
      classes[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
    const sizeClass =
      classes[`button${size.charAt(0).toUpperCase() + size.slice(1)}`];

    return (
      <button
        onClick={onClick}
        className={`${classes.button} ${variantClass} ${sizeClass} ${className}`}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

// Card Components
const ActiveSubscriptionsCard = React.memo(() => (
  <div className={classes.subscriptionCard}>
    <h2 className={classes.subscriptionCardTitle}>Active Subscriptions</h2>
    <div className={classes.subscriptionCardContent}>
      {ACCOUNT_SUMMARY.subscriptions.map((subscription, index) => (
        <SubscriptionItem
          key={`subscription-${index}`}
          subscription={subscription}
        />
      ))}
    </div>
  </div>
));

ActiveSubscriptionsCard.displayName = "ActiveSubscriptionsCard";

const SubjectSpendingCard = React.memo(() => (
  <div className={classes.card}>
    <div className={classes.cardHeader}>
      <h2 className={classes.cardTitle}>
        <PieChart className={classes.cardTitleIcon} />
        <span>Subject-wise Spending</span>
      </h2>
      <p className={classes.cardDescription}>Monthly breakdown by subject</p>
    </div>
    <div className={classes.cardContent}>
      <SimplePieChart data={SUBJECT_SPENDING} />
      <div className={classes.chartLegend}>
        {SUBJECT_SPENDING.map((item, index) => (
          <div key={`legend-${index}`} className={classes.legendItem}>
            <div className={classes.legendItemLeft}>
              <div
                className={classes.legendColor}
                style={{ backgroundColor: item.color }}
              />
              <span className={classes.legendLabel}>{item.subject}</span>
            </div>
            <span className={classes.legendValue}>${item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
));

SubjectSpendingCard.displayName = "SubjectSpendingCard";

const PaymentCard = React.memo(
  ({
    paymentAmount,
    setPaymentAmount,
  }: {
    paymentAmount: string;
    setPaymentAmount: (amount: string) => void;
  }) => {
    const handleFullBalance = useCallback(() => {
      setPaymentAmount(ACCOUNT_SUMMARY.totalBalance.toString());
    }, [setPaymentAmount]);

    const handleNextDue = useCallback(() => {
      setPaymentAmount(ACCOUNT_SUMMARY.nextPaymentAmount.toString());
    }, [setPaymentAmount]);

    const handlePaymentAmountChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentAmount(e.target.value);
      },
      [setPaymentAmount],
    );

    return (
      <div className={classes.card}>
        <div className={classes.cardHeader}>
          <h2 className={classes.cardTitle}>Make a Payment</h2>
          <p className={classes.cardDescription}>
            Pay your outstanding balance
          </p>
        </div>
        <div className={classes.cardContent}>
          <div className={classes.formGroup}>
            <label htmlFor="amount" className={classes.formLabel}>
              Amount
            </label>
            <input
              id="amount"
              type="number"
              value={paymentAmount}
              onChange={handlePaymentAmountChange}
              placeholder="Enter amount"
              className={classes.formInput}
            />
          </div>

          <div className={classes.buttonGroup}>
            <Button
              variant="outline"
              size="small"
              onClick={handleFullBalance}
              className={classes.balanceButton}
            >
              Full Balance
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={handleNextDue}
              className={classes.balanceButton}
            >
              Next Due
            </Button>
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="payment-method" className={classes.formLabel}>
              Payment Method
            </label>
            <select
              className={classes.formSelect}
              id="payment-method"
              defaultValue=""
            >
              <option value="" disabled>
                Select payment method
              </option>
              <option value="visa">Visa ****1234</option>
              <option value="mastercard">Mastercard ****5678</option>
            </select>
          </div>

          <Button className={classes.payButton}>Pay Now</Button>
        </div>
      </div>
    );
  },
);

PaymentCard.displayName = "PaymentCard";

const QuickActionsCard = React.memo(() => {
  const handleQuickAction = useCallback((action: string) => {
    // Navigation logic would go here
    console.log(`Navigate to ${action}`);
  }, []);

  return (
    <div className={classes.card}>
      <div className={classes.cardHeader}>
        <h2 className={classes.cardTitle}>Quick Actions</h2>
      </div>
      <div className={classes.cardContent}>
        <div className={classes.quickActions}>
          {QUICK_ACTIONS?.map((action, index) => (
            <button
              key={`action-${index}`}
              onClick={() => handleQuickAction(action.action)}
              className={classes.quickActionButton}
            >
              <div className={classes.quickActionContent}>
                <div className={classes.quickActionIcon}>
                  <action.icon />
                </div>
                <div className={classes.quickActionText}>
                  <h4 className={classes.quickActionTitle}>{action.title}</h4>
                  <p className={classes.quickActionDescription}>
                    {action.description}
                  </p>
                </div>
              </div>
              <ChevronRight className={classes.quickActionArrow} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

QuickActionsCard.displayName = "QuickActionsCard";

const RecentTransactionsCard = React.memo(() => {
  const handleViewAllTransactions = useCallback(() => {
    // Navigation logic would go here
    console.log("Navigate to full transaction history");
  }, []);

  return (
    <div className={classes.card}>
      <div className={classes.cardHeader}>
        <div className={classes.transactionHeader}>
          <h2 className={classes.cardTitle}>Recent Transactions</h2>
          <Button
            variant="ghost"
            onClick={handleViewAllTransactions}
            className={classes.viewAllButton}
          >
            View All
            <ArrowRight className={classes.viewAllIcon} />
          </Button>
        </div>
      </div>
      <div className={classes.cardContent}>
        <div className={classes.transactionList}>
          {RECENT_TRANSACTIONS.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </div>
    </div>
  );
});

RecentTransactionsCard.displayName = "RecentTransactionsCard";

// Main Component
export default function BillingPage() {
  const [paymentAmount, setPaymentAmount] = useState("");

  return (
    <div className={classes.container}>
      {/* Account Overview */}
      <div className={classes.accountOverview}>
        <OverviewCard
          label="Balance Due"
          amount={ACCOUNT_SUMMARY.totalBalance}
        />
        <OverviewCard
          label="Next Payment"
          amount={ACCOUNT_SUMMARY.nextPaymentAmount}
        />
        <OverviewCard
          label="Active Students"
          amount={ACCOUNT_SUMMARY.subscriptions.length}
        />
      </div>

      {/* Student Subscriptions */}
      {/* <ActiveSubscriptionsCard /> */}

      <div className={classes.twoColumnGrid}>
        {/* Subject-wise Spending Chart */}
        {/* <SubjectSpendingCard /> */}

        {/* Quick Payment */}
        {/* <PaymentCard
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
        /> */}
      </div>

      {/* Quick Actions */}
      {/* <QuickActionsCard /> */}

      {/* Recent Transactions */}
      {/* <RecentTransactionsCard /> */}
    </div>
  );
}
