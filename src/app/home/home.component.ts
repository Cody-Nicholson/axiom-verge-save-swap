import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import * as fs from 'fs'
import * as path from 'path';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  saveFolder: string;
  files: string[] = [];
  activeFile: string;
  rows: any[];
  saveFile: string;
  replaced: boolean;
  showInfo: boolean;

  constructor(public ngZone: NgZone, public changeDetector: ChangeDetectorRef) {
    this.saveFolder = localStorage.getItem('saveFolder');
    if(this.saveFolder){
      this.loadFiles();
      this.setSaveFile(this.saveFolder);
    }
  }

  loadFiles() {
    this.files = fs.readdirSync(this.saveFolder);
    this.rows = this.files.map(file => this.getFileRow(file));
  }

  onFolderSelect(event) {
    this.saveFolder = event.target.files[0].path;
    localStorage.setItem('saveFolder', this.saveFolder);
    this.loadFiles();
    
  }

  setSaveFile(folder: string){
    this.saveFile = path.join(folder, '..', 'Save3.sav');
  }

  selectFile(file: string) {
    this.activeFile = file;
  }

  getFileRow(file: string) {
    let split = file.split('_');
    let loc = split[2].replace('.sav', '');
    let nodes = '3';

    if (loc.includes('Nodes')) {
      nodes = loc.substring(loc.length - 8, loc.length - 6)
      loc = loc.substring(0, loc.length - 7);
    }

    return {
      area: split[1],
      loc,
      nodes,
      file,
    }
  }

  copyFile(fileName: string) {
    let source = path.join(this.saveFolder, fileName);
    fs.copyFileSync(source, this.saveFile);
    this.activeFile = fileName;
    this.watchSaveFile();
    this.replaced = false;
  }

  watchSaveFile(){
    this.unwatchSaveFile();

    fs.watchFile(this.saveFile, (curr) => {
      this.replaced = true;
      this.activeFile = null;
      fs.unwatchFile(this.saveFile);
      this.changeDetector.detectChanges();
    });
  }

  unwatchSaveFile() {
    if(this.saveFile){
      fs.unwatchFile(this.saveFile);
    }
  }

}
