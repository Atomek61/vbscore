class Score {

    constructor() {
      this.A = new Team(this, "A");
      this.B = new Team(this, "B");
      this._color = "red";
      this.onChanged = null;
      this._lastPoints = [0, 0];
      this._swapped = false;
      this._swapping = false;
    }

    doChanged(source) {
      if (this.onChanged)
        this.onChanged(source);
    }

    get color() {
      return this._color;
    }

    set color(value) {
      if (value!=this.color) {
        this._color = value;
        this.doChanged(this);
      }  
    }

    reset() {
      let lastPoints = [this.A.points, this.B.points];
      this.A.points = 0;
      this.B.points = 0;
      this._lastPoints = lastPoints;
    }

    nextColor() {
      if (this.color=="red")
        this.color = "green";
      else if (this.color=="green")
        this.color = "yellow";
      else if (this.color=="yellow")
        this.color = "blue";
      else
        this.color = "red";
    }

    revert() {
      let lastPoints = this._lastPoints;
      let points = [this.A.points, this.B.points];
      [this.A.points, this.B.points] = lastPoints;
      this._lastPoints = points;
    }

    get swapped() {
      return this._swapped;
    }

    set swapped(value) {          
      if (!this._swapping && this.swapped != value) {
        let [A, B] = this._lastPoints;  
        [this.A.points, this.B.points] = [this.B.points, this.A.points];
        this._lastPoints = [B, A];
        this._swapped = value;
      }
    }

    swap(interval) {
      if (!this._swapping) {
        this.swapped = true;
        this._swapping = true;
        setTimeout(()=>{
          this._swapping = false;
          this.swapped = false;
        }, interval);
      }
    }

  }

  class Team {

    constructor(score, name) {
      this._score = score;
      this._name = name;
      this._points = 0
    };

    get score() {
      return this._score;
    }

    set points(value) {
      if (value>99) value = 99;
      else if (value<0) value = 0;
      if (this.points!=value) {
        this.score._lastPoints = [this.score.A.points, this.score.B.points];
        this._points = value;
        this.score.doChanged(this);
      }
    }

    get points() {
      return this._points;
    }

    set name(value) {
      if (this.name!=value) {
        this._name = value;
        this.score.doChanged(this);
      }
    }

    get name() {
      return this._name;
    }

    inc(n = 1) {
      this.points = this.points + n
    }

    dec(n = 1) {
      if (n>this.points) n = this.points;
      this.points = this.points - n
    }
  }  

  // Encapsulates the Score with its 2 Teams and handles some GUI
  class ScoreGUI {

    constructor(container) {
      this.score = new Score();
      this.container = container;
      this.modulebar = new ModuleBar(this.select("leds"), "88:88");
      this.modulebar.modules[2].display(':');

      // extends the modules svg-groups with hidden rects for top and bottom to catch the click events
      // <rect id="topZone" name="top" x="0" y="0" width="100%" height="50%" visibility="hidden" cursor="pointer" pointer-events="painted" />
      // <rect id="bottomZone" name="bottom" x="0" y="50%" width="100%" height="50%" visibility="hidden" cursor="pointer" pointer-events="painted" />
      for (let i of [0, 1, 3, 4])
        this.modulebar.modules[i].onclick = (e)=>{this.onModuleClick(e)};

      this.score.onChanged = (source) => {
        if (source == this.score)
          this.updateDisplay(source);
        else 
          this.updateTeam(source)
      }     

      document.body.addEventListener('fullscreenchange', (event) => {
        if (document.fullscreenElement != null)
          this.select("full").style.backgroundImage= "url(img/full2.svg)";
        else
          this.select("full").style.backgroundImage= "url(img/full1.svg)";
      });

      this.updateDisplay();
    }

    onModuleClick(e) {
      let delta = e.target.zone == "top" ? 1 : -1;
      switch(e.target.module.index) {
        case 0:
          this.score.A.points += delta*10; 
          break;
        case 1:
          this.score.A.points += delta; 
          break;
        case 3:
          this.score.B.points += delta*10; 
          break;
        case 4:
          this.score.B.points += delta; 
          break;
        }
//      console.log("clicked: module["+e.target.module.index+"].zone="+e.target.zone)        
    }

    get fullscreen() {
      return document.fullscreenElement != null;
    }

    set fullscreen(value) {
      if (value!=this.fullscreen) {
        if (value)
          document.body.requestFullscreen();
        else
          document.exitFullscreen();
      }
    }

    updateTeam(team) {
      let points = team.points % 100
      let d1 = Math.floor(points / 10)
      if (d1==0) d1 = " "
      let d2 = points % 10
      if (team.name=="A") {
        this.modulebar.modules[0].display(d1.toString())
        this.modulebar.modules[1].display(d2.toString())
      } else {
        this.modulebar.modules[3].display(d1.toString())
        this.modulebar.modules[4].display(d2.toString())
      }
    }

    updateDisplay() {
      this.updateTeam(this.score.A);    
      this.updateTeam(this.score.B);    
    }

    select(classname) {
      return document.querySelector("#"+this.container.id + " ." + classname);
    }

  }

