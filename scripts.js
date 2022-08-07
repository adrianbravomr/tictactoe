const Player = (name,symbol='X',IA=false) => {
    return {name,symbol,IA}
};


const game = ((doc) => {

    let finished = false;
    let moves=0;
    let player1 = Player('Player 1','X');
    let player2 = Player('Player 2','O');
    let turn = player1;

    let turnUI = doc.querySelector('.turn');

    let cellsUI = doc.querySelectorAll('.cell');

    cellsUI.forEach( cell => {
        cell.addEventListener('click',(event)=>{
            let row = parseInt(cell.dataset.row);
            let col = parseInt(cell.dataset.col);
            if(!turn.IA) play(row,col);
        });
    });

    doc.querySelector('#reset').addEventListener('click', e => {
        reset();
    })

    const configScreen = () => {

        function formInput(type,placeholder='',required=false){
            let formIn = doc.createElement("input");
            formIn.classList.add("input");
            formIn.setAttribute("type",type);
            formIn.setAttribute("name",placeholder);
            let desc = placeholder;
            if(required) desc = `${placeholder}*`;
            formIn.setAttribute("placeholder",desc);
            if(required==true) formIn.setAttribute("required",'required');
            return formIn;
        }
        
        function formLabel(name,innerText=''){
            let label = doc.createElement("label");
            label.setAttribute("for",name);
            label.innerText=innerText;
            return label;
        }

        function submitForm(form){

            let p1Name = form['Player 1'].value
            let p2Name = form['Player 2'].value

            p1Name = p1Name == '' ? 'Player 1': p1Name
            p2Name = p2Name == '' ? 'Player 2': p2Name

            const player1 = Player(p1Name,'X',form['p1IA'].checked);
            const player2 = Player(p2Name,'O',form['p2IA'].checked);
            doc.querySelector('.modal').remove();
            setTimeout(IAplay,1000);
            return  {player1,player2}
        }
        
        let modal = doc.createElement('div');
        modal.classList.add('modal');

        let form = doc.createElement('form');
        form.classList.add('form');
        form.setAttribute("id","form")
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            let players = submitForm(form);
            player1 = players.player1;
            player2 = players.player2;
            turn = player1;
        });

        let legend = document.createElement("legend");
        legend.innerText="Who is playing?"

        let p1Name = formInput('text','Player 1');
        let p2Name = formInput('text','Player 2');
        
        let p1IA = doc.createElement('div');
        let p2IA = doc.createElement('div');

        p1IA.classList.add('checkbox');
        p2IA.classList.add('checkbox');

        p1IA.append(formInput('checkbox','p1IA'),formLabel('p1IA','CPU controlled'));
        p2IA.append(formInput('checkbox','p2IA'),formLabel('p2IA','CPU controlled'));

        let submitBtn=document.createElement("button");
        submitBtn.setAttribute("action","submit");
        submitBtn.innerText="Start!";
        submitBtn.classList.add("button");

        form.append(legend,p1Name,p1IA,p2Name,p2IA,submitBtn);
        modal.append(form);
        doc.body.append(modal);
    }

    const board = (() => {

        let cells=[
            ['','',''],
            ['','',''],
            ['','','']
        ];

        const updateCells = (value,row,col) =>{

            cells[row][col]=value;

            let winner = checkLines(row,col);

            return {value,row,col,winner};
        }
    
        const getLine = (axis,pos) => {
            if(axis=='row')
                return {'symbols':cells[pos],'coords':[[pos,0],[pos,1],[pos,2]]}
            else if(axis=='col')
                return {'symbols':cells.map((x) => x[pos]),'coords':[[0,pos],[1,pos],[2,pos]]}
            else if(axis=='diag')
                return {'symbols':[cells[0][0],cells[1][1],cells[2][2]],'coords':[[0,0],[1,1],[2,2]]}
            else if(axis=='invDiag')
                return {'symbols':[cells[0][2],cells[1][1],cells[2][0]],'coords':[[0,2],[1,1],[2,0]]}
        }
    
        const checkLine = (axis,pos,val) => {
                let line = getLine(axis,pos)
                return line.symbols.every
                (cell => cell==val) ? {'symbol':val,'line':line} : false
        }
    
        const checkLines = (row,col) => {
            let val = cells[row][col];
            return (checkLine('row',row,val))
            || (checkLine('col',col,val))
            || (checkLine('diag','',val))
            || (checkLine('invDiag','',val))
        }

        const paintCells = (cells) => {
            let coords = cells.line.coords;
            coords.forEach(coord => {
                cellsUI[coords2int(coord[0],coord[1])].classList.add('win')
            })
        }
    
        return {cells,updateCells,paintCells}
    
    })();

    const play = (row,col) =>{
        if(finished) reset();
        if(board.cells[row][col]==''){
            let movement = board.updateCells(turn.symbol,row,col);
            moves++;

            let cell = doc.querySelector(
                `[data-row="${row}"][data-col="${col}"]`
            )
            cell.textContent=turn.symbol;
            cell.classList.add(turn.symbol);
            console.log(movement);
            if(movement.winner.symbol || (moves>=9 && !movement.winner.symbol)){
                finish(movement.winner);
            }
            else{
                switchPlayer();
            }
            return movement
        }
        else{
            return false
        }
    }

    const switchPlayer = () => {
        turnUI.classList.remove(turn.symbol);
        turn = turn.name == player1.name ? player2: player1;
        turnUI.textContent=`${turn.name}'s turn`;
        turnUI.classList.add(turn.symbol);
        console.log(`${turn.name} turn`)

        //If IA is used
        setTimeout(IAplay,1000);
    }

    const IAplay = () => {
        if(!finished && ((player1.IA && turn.symbol==player1.symbol) 
        || (player2.IA && turn.symbol==player2.symbol))){
            let isValid = false;
            let row,col;
            while(!isValid){
                row = random(3);
                col = random(3);
                isValid = (board.cells[row][col]=='');
            }
            play(row,col);
        }
    }

    const finish = (movement) => {
        finished=true;
        let who = movement.symbol == player1.symbol ? player1 : player2;

        let msgContent = `Game finished! ${who.name} WINS`;
        let subContent = "Click anywhere to start again";
        let symbol = who.symbol;

        if(!movement){
            msgContent = "It's a tie!";
            symbol = 'tie';
        }
        else{
            board.paintCells(movement);
        }

        let modal = doc.createElement('div');

        let msg = doc.createElement('div');
        let msgSub = doc.createElement('div');
        msg.textContent=msgContent;
        msgSub.textContent=subContent;

        msg.classList.add(symbol);
        msg.classList.add('msg');
        msgSub.classList.add('msgSub');
        modal.classList.add('finish');

        modal.addEventListener('click', e => {
            e.preventDefault();
            reset();
        })

        console.log(msgContent);
        modal.append(msg,msgSub);
        doc.body.append(modal);
    }

    const random = (max) => {
        return Math.floor(Math.random() * max);
    }

    let int2cell = (int)  => {
        return {'row':int2row(int),'col':int2col(int)}
    }

    let int2row = (int) => {
        return parseInt(int/3)
    }

    let int2col = (int) => {
        return parseInt(int%3)
    }

    let coords2int = (row,col) => {
        return parseInt(row*3)+parseInt(col)
    }

    const reset = () => {
        moves = 0;
        let i = 0;

        cellsUI.forEach( cell => {
            board.cells[int2row(i)][int2col(i)]=''
            cell.textContent='';
            cell.classList.remove('win');
            cell.classList.remove('X');
            cell.classList.remove('O');
            i++;
        });

        turnUI.classList.remove(turn.symbol);
        turn = player1;
        turnUI.textContent='';
        finished=false;
       let modal = doc.querySelector('.finish')
       if(!!modal) modal.remove();
       console.log('Tic-tac-toe!')
       setTimeout(IAplay,1000);
    }


    configScreen();
    reset();
      
    return{play,reset};

})(document);