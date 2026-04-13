"use client";
import { useState, memo, useCallback, useMemo } from "react";
import styles from "./subjects-component.module.css";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
// import DropDown from "@/components/drop-down/drop-down";
import InputField from "@/components/global/input-field/input-field";
import Checkbox from "@mui/material/Checkbox";
import { Margin, WidthFull } from "@mui/icons-material";
import { toast } from "react-toastify";

interface Item {
  name: string;
  level: string;
  curriculum: string;
  currency: string;
  rate: string;
  is_approved?: boolean;
}

interface SubjectsComponentProps {
  item: Item;
  currency: any;
  handleChecked: (subject: any) => void;
  status?: string;
}

// Static styles moved outside component
const STATIC_STYLES = {
  inputBox: {
    width: "calc(clamp(1rem, 0.95rem + 0.25vw, 1.25rem) * 4 + 10px)",
    borderRadius: "5px",
    backgroundColor: "#E4F5FF",
    boxShadow: "none",
    position: "relative" as const,
    height: "100%",
    cursor: "pointer",
  },
  inputText: {
    fontSize: "clamp(1rem, 0.95rem + 0.25vw, 1.25rem)",
    lineHeight: "clamp(1rem, 0.95rem + 0.25vw, 1.25rem)",
    fontFamily: "var(--leagueSpartan-medium-500) !important",
    textAlign: "center" as const,
  },
  customIcon: {
    fontSize: "clamp(0.75rem, 0.7rem + 0.25vw, 1rem)",
    color: "var(--text-color)",
    position: "absolute" as const,
    top: "2px",
    right: "1px",
    width: "fit-content",
    padding: "0",
  },
  approvedBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: "20px",
    textTransform: "uppercase" as const,
    border: "none",
    width: "max-content",
    fontSize: "clamp(0.7rem, 0.65rem + 0.25vw, 0.9rem)",
    fontWeight: "600",
    letterSpacing: "0.5px",
    fontFamily: "var(--leagueSpartan-medium-500, inherit)",
    color: "#286320",
    backgroundColor: "#A0FFC0",
    boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
  },
  notApprovedBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: "20px",
    textTransform: "uppercase" as const,
    border: "none",
    width: "max-content",
    fontSize: "clamp(0.7rem, 0.65rem + 0.25vw, 0.9rem)",
    fontWeight: "600",
    letterSpacing: "0.5px",
    fontFamily: "var(--leagueSpartan-medium-500, inherit)",
    color: "#653838",
    backgroundColor: "#FFACAC",
    boxShadow: "0 2px 4px rgba(255, 172, 172, 0.2)",
  },
} as const;

// Pre-defined border styles
const BORDER_STYLES = {
  checked: { border: "1px solid var(--main-color)" },
  unchecked: {},
} as const;

// Error messages as constants
const ERROR_MESSAGES = {
  INVALID_NUMBER: "Please enter a valid number for the rate.",
  MISSING_RATE: "Please enter a rate before selecting the subject.",
} as const;

// Memoized StatusBadge component
const StatusBadge = memo(({ isApproved }: { isApproved: boolean }) => (
  <span
    style={
      isApproved ? STATIC_STYLES.approvedBadge : STATIC_STYLES.notApprovedBadge
    }
  >
    {isApproved ? "✓ Accepted" : "✗ Not Accepted"}
  </span>
));
StatusBadge.displayName = "StatusBadge";

// Memoized SubjectInfo component
const SubjectInfo = memo(
  ({ item, hasApprovalKey }: { item: Item; hasApprovalKey: boolean }) => (
    <div>
      <p>
        {item.name} <span>| {item.level}</span>
      </p>
      <p>{item.curriculum}</p>
      {hasApprovalKey && <StatusBadge isApproved={item.is_approved === true} />}
    </div>
  )
);
SubjectInfo.displayName = "SubjectInfo";

// Memoized RateDisplay component
const RateDisplay = memo(
  ({ currency, rate }: { currency: any; rate: string }) => (
    <div>
      {currency} {rate}
      <span>/hr</span>
    </div>
  )
);
RateDisplay.displayName = "RateDisplay";

const SubjectsComponent: React.FC<SubjectsComponentProps> = memo(
  ({ item, currency, handleChecked, status }) => {
    // const [click, setClick] = useState(false);
    const [checked, setChecked] = useState(item.is_approved || false);
    const [input, setInput] = useState(item.rate);

    // Memoized computed values
    const isStatusApproved = useMemo(() => status === "Approved", [status]);
    const hasApprovalKey = useMemo(() => "is_approved" in item, [item]);

    // Use pre-defined styles based on checked state
    const containerStyles = useMemo(
      () => (checked ? BORDER_STYLES.checked : BORDER_STYLES.unchecked),
      [checked]
    );

    // Optimized checkbox handler with memoized validation
    const handleCheckBox = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        if (!isChecked) {
          handleChecked({
            ...item,
            rate: item.rate,
            is_approved: isChecked,
          });
          setInput(item.rate);
        }
        setChecked(isChecked);
        if (input) {
          const inputValue = Number(input);
          if (!isNaN(inputValue)) {
            handleChecked({
              ...item,
              rate: input === "" ? item.rate : input,
              is_approved: isChecked,
            });
          } else {
            toast.error("Please enter a valid number for the rate.");
            setInput(item.rate);
          }
        } else {
          toast.error("Please enter a rate before selecting the subject.");
          setInput(item.rate);
        }
      },
      [input, item, handleChecked]
    );

    // Optimized input handler
    const handleInputField = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setInput(newValue);
        if (checked) {
          setChecked(false);
          handleChecked({
            ...item,
            rate: newValue,
            is_approved: false,
          });
        }
      },
      [checked]
    );

    // const handleClick = useCallback(() => {
    //   if (!hasApprovalKey) {
    //     setClick(prev => !prev);
    //   }
    // }, [hasApprovalKey]);

    return (
      <div className={styles.container} style={containerStyles}>
        <div className={styles.box1}>
          {!isStatusApproved && (
            <Checkbox
              checked={checked}
              onChange={handleCheckBox}
              inputProps={{ "aria-label": `Select ${item.name}` }}
            />
          )}
          <SubjectInfo item={item} hasApprovalKey={hasApprovalKey} />
        </div>
        <div className={styles.box2}>
          {!isStatusApproved ? (
            <InputField
              value={input}
              changeFunc={handleInputField}
              type="text"
              icon2="/hr"
              inputBoxStyles={STATIC_STYLES.inputBox}
              inputStyles={STATIC_STYLES.inputText}
              customIconStyles={STATIC_STYLES.customIcon}
            />
          ) : (
            <RateDisplay currency={currency} rate={item.rate} />
          )}
          {/* {!isStatusApproved && (
            <span
              onClick={handleClick}
              style={{
                ...(click ? { color: "var(--main-color)" } : undefined),
                cursor: "pointer",
              }}
            >
              <EditOutlinedIcon />
            </span>
          )} */}
        </div>
      </div>
    );
  },
  // Custom comparison function for memo
  (prevProps, nextProps) => {
    return (
      prevProps.item.name === nextProps.item.name &&
      prevProps.item.level === nextProps.item.level &&
      prevProps.item.curriculum === nextProps.item.curriculum &&
      prevProps.item.rate === nextProps.item.rate &&
      prevProps.item.is_approved === nextProps.item.is_approved &&
      prevProps.currency === nextProps.currency &&
      prevProps.status === nextProps.status &&
      prevProps.handleChecked === nextProps.handleChecked
    );
  }
);

SubjectsComponent.displayName = "SubjectsComponent";

export default SubjectsComponent;
