import type { TableStyles } from "react-data-table-component";
import { ADMIN_PALETTE } from "./tokens";

export const adminTableStyles: TableStyles = {
  table: {
    style: {
      backgroundColor: ADMIN_PALETTE.surface,
    },
  },
  headRow: {
    style: {
      backgroundColor: "#FAFBFA",
      minHeight: "44px",
      borderBottom: `1px solid ${ADMIN_PALETTE.line}`,
    },
  },
  headCells: {
    style: {
      color: ADMIN_PALETTE.innovador,
      fontWeight: 700,
      fontSize: "0.7rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      paddingLeft: "12px",
      paddingRight: "12px",
    },
  },
  rows: {
    style: {
      minHeight: "48px",
      fontSize: "0.88rem",
      color: "#1A1A1A",
      borderBottom: `1px solid ${ADMIN_PALETTE.line}`,
    },
    stripedStyle: {
      backgroundColor: "#FCFDFC",
    },
    highlightOnHoverStyle: {
      backgroundColor: "#F3F8F1",
      borderBottomColor: ADMIN_PALETTE.line,
      outline: "none",
    },
  },
  cells: {
    style: {
      paddingLeft: "12px",
      paddingRight: "12px",
    },
  },
  pagination: {
    style: {
      borderTop: `1px solid ${ADMIN_PALETTE.line}`,
      color: ADMIN_PALETTE.muted,
      minHeight: "56px",
    },
    pageButtonsStyle: {
      fill: ADMIN_PALETTE.oferta,
      "&:disabled": {
        fill: ADMIN_PALETTE.line,
      },
    },
  },
  expanderRow: {
    style: {
      backgroundColor: "#FCFDFC",
    },
  },
};
