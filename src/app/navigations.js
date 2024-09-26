export const navigations = [
  { label: "PAGES", type: "label" },
  {
    name: "Dashboard",
    icon: "dashboard",
    children: [
      { name: "Go to Dashboard", iconText: "SI", path: "/dashboard/default" },
      { name: "Approved", iconText: "SU", path: "/session/signup" },
      { name: "Rejected", iconText: "SU", path: "/session/signup" },
      { name: "Approval pending", iconText: "SU", path: "/session/signup" },
      { name: "Review raised", iconText: "SU", path: "/session/signup" },
    ]
  },
  {
    name: "Policy, SOP & Guidance Note",
    icon: "description",
    children: [
      { name: "List of Policies, SOPs & Guidance notes", iconText: "SI", path: "/dashboard/default" },
      { name: "Initiate a Policy, SOP or Guidance note", iconText: "SU", path: "/initiate/psg" },
    ]
  },
  {
    name: "Circulars & Advisories",
    icon: "timer",
    children: [
      { name: "List of Circulars & Advisories", iconText: "SI", path: "/dashboard/default" },
      { name: "Initiate a Circular or Advisory", iconText: "SU", path: "/session/signup" },
    ]
  },
  { label: "Components", type: "label" },
  {
    name: "Components",
    icon: "favorite",
    badge: { value: "30+", color: "secondary" },
    children: [
      { name: "Auto Complete", path: "/material/autocomplete", iconText: "A" },
      { name: "Buttons", path: "/material/buttons", iconText: "B" },
      { name: "Checkbox", path: "/material/checkbox", iconText: "C" },
      { name: "Dialog", path: "/material/dialog", iconText: "D" },
      { name: "Expansion Panel", path: "/material/expansion-panel", iconText: "E" },
      { name: "Form", path: "/material/form", iconText: "F" },
      { name: "Icons", path: "/material/icons", iconText: "I" },
      { name: "Menu", path: "/material/menu", iconText: "M" },
      { name: "Progress", path: "/material/progress", iconText: "P" },
      { name: "Radio", path: "/material/radio", iconText: "R" },
      { name: "Switch", path: "/material/switch", iconText: "S" },
      { name: "Slider", path: "/material/slider", iconText: "S" },
      { name: "Snackbar", path: "/material/snackbar", iconText: "S" },
      { name: "Table", path: "/material/table", iconText: "T" }
    ]
  },
  {
    name: "Charts",
    icon: "trending_up",
    children: [{ name: "Echarts", path: "/charts/echarts", iconText: "E" }]
  },
  {
    name: "Documentation",
    icon: "launch",
    type: "extLink",
    path: "http://demos.ui-lib.com/matx-react-doc/"
  }
];
