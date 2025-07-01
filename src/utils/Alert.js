import Swal from 'sweetalert2';

const getThemeClass = () => {
  const theme = document.documentElement.dataset.theme;
  return theme === 'dark' ? 'swal2-popup-dark' : '';
};

export const SweetAlert = {
  Message: {
    Success: ({ title = 'Success', text = '', ...configs } = {}) => {
      Swal.fire({
        icon: 'success',
        title,
        text,
        position: 'center',
        timerProgressBar: true,
        timer: 6000,
        customClass: { popup: getThemeClass() },
        ...configs,
      });
    },

    Error: ({ title = 'Error', text = '', ...configs } = {}) => {
      Swal.fire({
        icon: 'error',
        title,
        text,
        position: 'center',
        customClass: { popup: getThemeClass() },
        ...configs,
      });
    },

    Warning: ({ title = 'Are you sure?', text = "You won't be able to revert this!", ...configs } = {}) => {
      Swal.fire({
        icon: 'warning',
        title,
        text,
        position: 'center',
        customClass: { popup: getThemeClass() },
        ...configs,
      });
    },
  },

  Toast: {
    Success: ({ title = 'Success', text = '', position = 'top-end', ...configs } = {}) => {
      Swal.fire({
        toast: true,
        icon: 'success',
        title,
        text,
        position,
        timerProgressBar: true,
        timer: 6000,
        customClass: { popup: getThemeClass() },
        ...configs,
      });
    },

    Error: ({ title = 'Error', text = '', position = 'top-end', ...configs } = {}) => {
      Swal.fire({
        toast: true,
        icon: 'error',
        title,
        text,
        position,
        timerProgressBar: true,
        timer: 6000,
        customClass: { popup: getThemeClass() },
        ...configs,
      });
    },

    Confirm: async ({
      title = 'Are you sure?',
      text = "You won't be able to revert this!",
      confirmButtonText = 'Yes, proceed',
      cancelButtonText = 'Cancel',
      ...configs
    } = {}) => {
      const result = await Swal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        customClass: { popup: getThemeClass() },
        ...configs,
      });
      return result.isConfirmed;
    },
  },
};
