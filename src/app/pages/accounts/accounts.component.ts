import { Component } from '@angular/core';
import { LoginComponent } from '@app/components/login/login.component';

@Component({
  selector: 'app-accounts',
  imports: [LoginComponent],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss'
})
export class AccountsComponent {

}
