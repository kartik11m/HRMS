import { toast } from 'react-toastify';

export const showNotification = (message, type = 'info') => {
  toast[type](message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showMessageNotification = (senderName, message) => {
  showNotification(`📨 New message from ${senderName}: ${message.slice(0, 50)}...`, 'info');
};