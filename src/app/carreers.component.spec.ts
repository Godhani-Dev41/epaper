import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarreersComponent } from './career.component';

describe('CarreersComponent', () => {
  let component: CarreersComponent;
  let fixture: ComponentFixture<CarreersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarreersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarreersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
