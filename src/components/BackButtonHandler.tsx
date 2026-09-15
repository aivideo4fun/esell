'use client';
import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export function BackButtonHandler() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const listenerPromise = App.addListener('backButton', ({ canGoBack }) => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
      return () => {
        listenerPromise.then((l) => l.remove());
      };
    }
  }, []);
  return null;
}