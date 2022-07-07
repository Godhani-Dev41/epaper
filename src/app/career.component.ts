import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AccountService} from "./account/account.service";

@Component({
  selector: 'app-carreers',
  templateUrl: './carreers.component.html',
  styleUrls: ['./carreers.component.scss'],
  providers: [AccountService]
})
export class CareerComponent implements OnInit {
  public careerForm: FormGroup
  public isLoading: boolean;
  public successMessage: string;

  constructor(private fb: FormBuilder,private accountService: AccountService) { }

  ngOnInit() {
    this.careerForm = this.fb.group({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      position: new FormControl('', Validators.required),
      comments: new FormControl('', Validators.required)
    });
  }

  submit() {
    this.isLoading = true;
    this.successMessage = undefined;
    const careerData = new FormData();
    careerData.append('name',this.careerForm.get("name").value);
    careerData.append('email',this.careerForm.get("email").value);
    careerData.append('position',this.careerForm.get("position").value);
    careerData.append('comments',this.careerForm.get("comments").value);
    this.accountService.career(careerData).subscribe( res => {
      this.isLoading = false;
      this.successMessage = "Thank you for your interest in joining our team. Our team will reach out shortly.";
    })
  }

}
