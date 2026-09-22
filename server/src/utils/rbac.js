const VALID_ROLES = [
  'ADMIN',
  'CUSTOMER',
  'ROOM_MANAGER',
  'APPROVAL_MANAGER',
  'ACCOUNTANT',
  'RECEPTIONIST',
  'AUDITOR',
];

const PUBLIC_SIGNUP_ROLE = 'CUSTOMER';

const normalizePublicSignupRole = (requestedRole) => {
  const role = String(requestedRole || '').trim().toUpperCase();
  return VALID_ROLES.includes(role) ? PUBLIC_SIGNUP_ROLE : PUBLIC_SIGNUP_ROLE;
};

const isAllowedRoleAssignment = (requestedRole) => {
  if (!requestedRole) return false;
  const role = String(requestedRole).trim().toUpperCase();
  return VALID_ROLES.includes(role);
};

module.exports = {
  VALID_ROLES,
  ALLOWED_ROLES: VALID_ROLES,
  PUBLIC_SIGNUP_ROLE,
  normalizePublicSignupRole,
  isAllowedRoleAssignment,
};
