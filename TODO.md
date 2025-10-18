# TODO: Add Sorting to Admin Dashboard Bills Table

## Steps to Complete

- [ ] Add state variables for sortColumn and sortDirection in AdminDashboard component
- [ ] Remove server-side sorting from billService query constraints
- [ ] Implement client-side sorting logic using useMemo for bills array
- [ ] Make table headers clickable: add onClick handlers for sortable columns (Order Code, Customer, Total Amount, Time)
- [ ] Add visual sort indicators (arrows) next to clickable headers
- [ ] Update table body to render sorted bills
- [ ] Test sorting functionality by clicking headers
