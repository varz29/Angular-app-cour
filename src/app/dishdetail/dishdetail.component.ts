import { Component, OnInit, Input, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment'
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility', [
      state('shown', style({
        transform: 'scale(1.0)',
        opacity: 1
      })),
      state('hidden', style({
        transform: 'scale(0.5)',
        opacity: 0
      })),
      transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
})
export class DishdetailComponent implements OnInit {
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  author;
  rating;
  comment;
  errMess: string;
  dishcopy: Dish;
  visibility = 'shown';



  formErrors = {
    'author': '',
    'comment': ''
  };


  validationMessages = {
    'author': {
      'required': 'Name is required.',
      'minlength': 'Name must be at least 2 characters long.',
      'maxlength': 'Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required': 'comment is required.',
      'minlength': 'comment must be at least 2 characters long.',

    }
  };



  constructor(private dishService: DishService, private route: ActivatedRoute, private location: Location, private fb: FormBuilder, @Inject('BaseURL') private baseURL) {
    this.createForm();

  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds,
      errmess => this.errMess = <any>errmess);
    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishService.getDish(params['id']); }))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; }, errmess => this.errMess = <any>errmess);
    this.dishService.getDish(id)
      .subscribe((dish) => (this.dish = dish,
        errmess => this.errMess = <any>errmess));
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: [5],
      comment: ['', [Validators.required, Validators.minLength(2)]]
    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  onValueChanged(data?: any) {
    console.log(this.commentForm);
    this.comment = this.commentForm.get('comment').value;
    this.author = this.commentForm.get('author').value;
    this.rating = this.commentForm.get('rating').value;

    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {

    let date = new Date();
    let dateISO = date.toISOString();
    let newcomment: Comment = {
      'author': this.author,
      'comment': this.comment,
      'rating': this.rating,
      'date': dateISO
    }
    this.dishcopy.comments.push(newcomment);
    this.dish.comments.push(newcomment);
    this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
        errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
    this.commentForm.reset();
    this.commentForm.reset({
      'author': '',
      'comment': '',
      'rating': 5
    }
    );
  }

  goBack(): void {
    this.location.back();
  }

}
