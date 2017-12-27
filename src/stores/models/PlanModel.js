// @flow

import { action, observable } from 'mobx';
import { YearModel } from './YearModel';
import { ColorModel } from './ColorModel';
import { CourseLocation } from './CourseLocation';
import { TermLocation } from './TermLocation';
import { YearLocation } from './YearLocation';

export class PlanModel {
  @observable title = '';
  @observable isPublic = false;
  @observable colorScheme = [];
  @observable years = [];

  constructor(
    title = 'My New Course Plan',
    isPublic = false,
    colorScheme = [],
    years = [],
  ) {
    this.title = title;
    this.isPublic = isPublic;
    this.years = years;
    this.colorScheme = colorScheme;
    this.colorScheme.push(new ColorModel());
  }

  @action.bound addYear(
    title = '2000',
    terms = [],
  ) {
    this.years.push(new YearModel(title, terms));
  }

  @action.bound addColor(
    dept = 'DEPT',
    color = 'rgb(12, 148, 0)',
  ) {
    this.colorScheme.push(new ColorModel(dept, color));
  }

  findCourse(courseId) {
    let location;
    this.years.forEach((thisYear, yearIndex) => (
      thisYear.terms.forEach((thisTerm, termIndex) => (
        thisTerm.courses.forEach((thisCourse, courseIndex) => {
          if (thisCourse.id === courseId) {
            location = new CourseLocation(thisCourse, yearIndex, termIndex, courseIndex);
          }
        })
      ))
    ));
    return location;
  }

  findTerm(termId) {
    let term;
    this.years.forEach((thisYear, yearIndex) => (
      thisYear.terms.forEach((thisTerm, termIndex) => {
        if (thisTerm.id === termId) {
          term = new TermLocation(thisTerm, yearIndex, termIndex);
        }
      })
    ));
    return term;
  }

  findYear(yearId) {
    let year;
    this.years.forEach((thisYear, yearIndex) => {
      if (thisYear.id === yearId) {
        year = new YearLocation(thisYear, yearIndex);
      }
    });
    return year;
  }

  handleDragDrop(result) {
    switch(result.type) {
      case 'PLAN-YEAR':
        this.onDragYearEnd(result);
        break;
      case 'YEAR-TERM':
        this.onDragTermEnd(result);
        break;
      case 'TERM-COURSE':
        this.onDragCourseEnd(result);
        break;
      default:
        // I dunno, cry about it?
        return;
    }
  }

  @action.bound onDragYearEnd(result) {
    if (!result.destination) {
      return; // The year was dropped in its current location
    }

    const targetYear = this.findYear(result.draggableId);
    const targetPlan = this;
    const sourcePlan = this;

    sourcePlan.years.splice(targetYear.yearIndex, 1);
    targetPlan.years.splice(result.destination.index, 0, targetYear.yearRef);
  }

  @action.bound onDragTermEnd(result) {
    if (!result.destination) {
      return; // The term was dropped in its current location
    }

    const targetTerm = this.findTerm(result.draggableId);
    const targetYear = this.findYear(result.destination.droppableId);
    const sourceYear = this.findYear(result.source.droppableId);

    sourceYear.yearRef.terms.splice(targetTerm.termIndex, 1);
    targetYear.yearRef.terms.splice(result.destination.index, 0, targetTerm.termRef);
  }

  @action.bound onDragCourseEnd(result) {
    if (!result.destination) {
      return; // The course was dropped in its current location
    }

    const targetCourse = this.findCourse(result.draggableId);
    const targetTerm = this.findTerm(result.destination.droppableId);
    const sourceTerm = this.findTerm(result.source.droppableId);

    sourceTerm.termRef.courses.splice(targetCourse.courseIndex, 1);
    targetTerm.termRef.courses.splice(result.destination.index, 0, targetCourse.courseRef);
  }
}
