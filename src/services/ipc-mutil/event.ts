import { EventEmitter } from 'events';
import { Options } from '../updater/common';

type EventEmitterLike = EventEmitter | Electron.EventEmitter

interface Filter {
  (...args: any[]): boolean
}

interface Resolver {
  (...args: any[]): any[]
}

export class Handler {
  private listener: Listener
  private fn: (...args: any[]) => void

  public constructor (listener: Listener, fn: (...args: any[]) => void) {
    this.listener = listener;
    this.fn = fn;
  }

  public dispose (): void {
    this.listener.off(this.fn);
  }
}

export interface Listener {
  on (fn: (...args: any[]) => void, disposable?: boolean): Handler
  off (fn: (...args: any[]) => void): void
  dispose (): void
}

export const createEventListener = function(
  event: EventEmitterLike, 
  eventName: string, 
  resolver?: Resolver, 
  filter?: Filter) {
  const disposables = new Set<Function>();
  const chains = new Set<Function>();

  let handler: (...args: any[]) => void | undefined  = (...args: any[]): void => {
      if (filter) {
        if (!filter(...args)) {
          return; 
        }
      }

      if (resolver) {
        args = resolver(...args);
      }

      chains.forEach((handler): void => {
        try {
          handler(...args);
        } catch (e) {

        }
      });
      
      disposables.forEach((handler): void => {
        chains.delete(handler);
      });
      disposables.clear();
    };

    event.on(eventName, handler);

  return {
    on (fn: (...args: any[]) => void, disposable = false): Handler {
      chains.add(fn);
      if (disposable) {
        disposables.add(fn);
      }
      return new Handler(this, fn);
    },
  
    off (fn: (...args: any[]) => void): void {
      chains.delete(fn);
      disposables.delete(fn);
    },
  
    dispose (): void {
      chains.clear();
      disposables.clear();
  
      if (handler) {
        event.removeListener(eventName, handler);
        handler = undefined;
      }
    }
  }
}