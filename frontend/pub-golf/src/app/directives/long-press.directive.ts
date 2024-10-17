import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appLongPress]',
  standalone: true
})
export class LongPressDirective {
  @Output() longPress = new EventEmitter<MouseEvent | TouchEvent>();

  private timeoutId: any;
  private isLongPress = false;
  private readonly delay = 500; // Duration in milliseconds for long press

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onMouseDown(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.isLongPress = false;
    this.timeoutId = setTimeout(() => {
      this.isLongPress = true;
      this.longPress.emit(event);
    }, this.delay);
  }

  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  @HostListener('mouseout', ['$event'])
  @HostListener('touchend', ['$event'])
  @HostListener('touchcancel', ['$event'])
  onMouseUp(event: MouseEvent | TouchEvent) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}