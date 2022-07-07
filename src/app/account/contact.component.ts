import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AccountService} from "./account.service";
import validate = WebAssembly.validate;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  providers: [AccountService]
})
export class ContactComponent implements OnInit {
  public contactForm: FormGroup;
  public isLoading: boolean;
  public successMessage: string;

  constructor(private fb: FormBuilder,private accountService: AccountService) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required),
      comments: new FormControl('', Validators.required)
    });
  }

  submit() {
    this.isLoading = true;
    this.successMessage = undefined;
    const contactData = new FormData();
    contactData.append('name',this.contactForm.get("name").value);
    contactData.append('email',this.contactForm.get("email").value);
    contactData.append('subject',this.contactForm.get("subject").value);
    contactData.append('comments',this.contactForm.get("comments").value);
    this.accountService.contact(contactData).subscribe( res => {
      this.isLoading = false;
      this.successMessage = "Thank you for contacting us. Your message is very important to us and we will get back to you shortly.";
    })
  }

}
