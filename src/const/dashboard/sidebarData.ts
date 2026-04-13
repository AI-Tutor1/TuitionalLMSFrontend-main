interface IconItem {
  icon: string | JSX.Element;
  route: string;
  name: string;
}
export const getIconsArray = (role: string): IconItem[] => {
  const baseRoute = role;

  const allRoutes: IconItem[] = [
    {
      icon: "/assets/svgs/menuBarIcons/dashboard.svg",
      route: `/${baseRoute}/dashboard`,
      name: "Dashboard",
    },
    {
      icon: "/assets/svgs/menuBarIcons/roles.svg",
      route: `/${baseRoute}/roles`,
      name: "Roles",
    },
    {
      icon: "/assets/svgs/menuBarIcons/page.svg",
      route: `/${baseRoute}/pages`,
      name: "Pages",
    },
    {
      icon: "/assets/svgs/menuBarIcons/permissions.svg",
      route: `/${baseRoute}/permissions`,
      name: "Permissions",
    },
    {
      icon: "/assets/svgs/menuBarIcons/policies.svg",
      route: `/${baseRoute}/policies`,
      name: "Policies",
    },
    {
      icon: "/assets/svgs/menuBarIcons/broadcast.svg",
      route: `/${baseRoute}/ongoing-classes`,
      name: "Ongoing Classes",
    },
    {
      icon: "/assets/svgs/menuBarIcons/enrollment.svg",
      route: `/${baseRoute}/enrollments`,
      name: "Enrollments",
    },
    {
      icon: "/assets/svgs/menuBarIcons/sessions.svg",
      route: `/${baseRoute}/sessions`,
      name: "Sessions",
    },
    {
      icon: "/assets/svgs/menuBarIcons/classschedule.svg",
      route: `/${baseRoute}/class-schedule`,
      name: "Class Schedule",
    },
    {
      icon: "/assets/svgs/menuBarIcons/calendar.svg",
      route: `/${baseRoute}/class-calendar`,
      name: "Class Calendar",
    },
    {
      icon: "/assets/svgs/menuBarIcons/reschedules.svg",
      route: `/${baseRoute}/reschedules`,
      name: "Reschedules",
    },
    {
      icon: "/assets/svgs/menuBarIcons/users.svg",
      route: `/${baseRoute}/users`,
      name: "Users",
    },
    {
      icon: "/assets/svgs/menuBarIcons/student.svg",
      route: `/${baseRoute}/students`,
      name: "Students",
    },
    {
      icon: "/assets/svgs/menuBarIcons/teacher.svg",
      route: `/${baseRoute}/teachers`,
      name: "Teachers",
    },
    {
      icon: "/assets/svgs/menuBarIcons/parents.svg",
      route: `/${baseRoute}/parents`,
      name: "Parents",
    },
    {
      icon: "/assets/svgs/menuBarIcons/subjects.svg",
      route: `/${baseRoute}/resources`,
      name: "Resources",
    },

    {
      icon: "/assets/svgs/menuBarIcons/chat.svg",
      route: `/${baseRoute}/chat`,
      name: "Chat",
    },
    {
      icon: "/assets/svgs/menuBarIcons/tutorreq.svg",
      route: `/${baseRoute}/tutor-requests`,
      name: "Tutor Request",
    },
    {
      icon: "/assets/svgs/menuBarIcons/reschedulereq.svg",
      route: `/${baseRoute}/reschedule-request`,
      name: "Reschedule Request",
    },
    {
      icon: "/assets/svgs/menuBarIcons/transactions.svg",
      route: `/${baseRoute}/transactions`,
      name: "Transactions",
    },
    {
      icon: "/assets/svgs/menuBarIcons/billing.svg",
      route: `/${baseRoute}/billing`,
      name: "Billing",
    },
    {
      icon: "/assets/svgs/menuBarIcons/invoice.svg",
      route: `/${baseRoute}/invoices`,
      name: "Invoices",
    },
    {
      icon: "/assets/svgs/menuBarIcons/profile.svg",
      route: `/${baseRoute}/profile`,
      name: "Profile",
    },
    {
      icon: "/assets/svgs/menuBarIcons/earnings.svg",
      route: `/${baseRoute}/payouts`,
      name: "Payouts",
    },
    {
      icon: "/assets/svgs/menuBarIcons/setting.svg",
      route: `/${baseRoute}/settings`,
      name: "Settings",
    },
    {
      icon: "/assets/svgs/menuBarIcons/earnings.svg",
      route: `/${baseRoute}/billing-payments`,
      name: "Billing & Payments",
    },
    {
      icon: "/assets/svgs/menuBarIcons/earnings.svg",
      route: `/${baseRoute}/earnings`,
      name: "Earnings",
    },
    {
      icon: "/assets/svgs/menuBarIcons/demo.svg",
      route: `/${baseRoute}/demo`,
      name: "Demo",
    },
  ];

  if (role === "superAdmin") {
    return allRoutes;
  }

  if (role === "admin") {
    return allRoutes;
  }

  if (role === "teacher") {
    return allRoutes;
  }

  if (role === "student") {
    return allRoutes;
  }

  if (role === "parent") {
    return allRoutes;
  }

  return [];
};
