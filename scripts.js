const Player = (name,symbol='X',IA=false) => {
    return {name,symbol,IA}
};


const game = ((doc) => {

    let player1;
    let player2;
    let turn = player1;

    let turnUI = doc.querySelector('.turn');

    let cellsUI = doc.querySelectorAll('.cell');

    cellsUI.forEach( cell => {
        cell.addEventListener('click',(event)=>{
            let row = cell.dataset.row;
            let col = cell.dataset.col;
            play(row,col);
        });
    });

    doc.querySelector('#reset').addEventListener('click', e => {
        board.reset();
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

    configScreen();

    const board = (() => {

        let cells=[
            ['','',''],
            ['','',''],
            ['','','']
        ];
    
        let moves=0;
    
    
        const updateCells = (value,row,col) =>{

            let isValid = false;

            if(cells[row][col]==''){
                cells[row][col]=value;
                isValid = true;
                moves++;
            }
            //else console.log('Cell is already been used');

            let winner = checkLines(row,col);

            if(winner){
                finish(winner);
            };

            if(moves>=9 && !winner){
                finish('tie');
            } 
            return isValid;
        }

        const reset = () => {
            moves = 0;
            for(let row=0;row<=2;row++){
                for(let col=0;col<=2;col++){
                    cells[row][col]='';
                    let cell = doc.querySelector(
                        `[data-row="${row}"][data-col="${col}"]`
                        )
                    cell.textContent='';
                    cell.classList.remove('X');
                    cell.classList.remove('O');
                }
                turnUI.classList.remove(turn.symbol);
                turn = player1;
                turnUI.textContent='';
            }

        }
    
        const getLine = (axis,pos) => {
            if(axis=='row')
                return cells[pos]
            else if(axis=='col')
                return cells.map((x) => x[pos])
            else if(axis=='diag')
                return [cells[0][0],cells[1][1],cells[2][2]]
            else if(axis=='invDiag')
                return [cells[0][2],cells[1][1],cells[2][0]]
        }
    
        const checkLine = (axis,pos,val) => {
                return getLine(axis,pos).every
                (cell => cell==val) ? val : false
        }
    
        const checkLines = (row,col) => {
            let val = cells[row][col];
            return (checkLine('row',row,val))
            || (checkLine('col',col,val))
            || (checkLine('diag','',val))
            || (checkLine('invDiag','',val))
        }
    
        return {cells,moves,updateCells,reset}
    
    })();

    const play = (row,col) =>{
        let isValid = board.updateCells(turn.symbol,row,col);
        if (isValid)    {
            let cell = doc.querySelector(
                `[data-row="${row}"][data-col="${col}"]`
                )
            cell.textContent=turn.symbol;
            cell.classList.add(turn.symbol);
            switchPlayer();
        }
        return isValid
    }

    const switchPlayer = () => {
        turnUI.classList.remove(turn.symbol);
        turn = turn.name == player1.name ? player2: player1;
        turnUI.textContent=`${turn.name}'s turn`;
        turnUI.classList.add(turn.symbol);
    }

    const finish = (winner) => {
        if(winner){
            

            let who = winner == player1.symbol ? player1 : player2;

            let msgContent = `Game finished! ${who.name} wins`;
            let subContent = "Click anywhere to start again";

            if(winner=='tie'){
                msgContent = "It's a tie!";
            }

            let modal = doc.createElement('div');

            let msg = doc.createElement('div');
            let msgSub = doc.createElement('div');
            msg.textContent=msgContent;
            msgSub.textContent=subContent;

            msg.classList.add(who.symbol);
            msgSub.classList.add('msgSub');
            modal.classList.add('modal');

            modal.addEventListener('click', e => {
                e.preventDefault();
                doc.querySelector('.modal').remove();
                board.reset();
            })


            modal.append(msg,msgSub);
            doc.body.append(modal);
        }
    }

    return{play};

})(document);