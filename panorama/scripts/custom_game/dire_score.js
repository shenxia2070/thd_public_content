
let temp =  $.GetContextPanel()
while ( (temp = temp.GetParent()) != null ){
    Game.root = temp
}

Game.find = (id,root) => {
    if (root){
        return root.FindChildTraverse(id)
    }
    return Game.root.FindChildTraverse(id)
}

Game.find('TopBarDireScore').text = 0
GameEvents.Subscribe('SetTopBarDireScore', (data) => {
    Game.find('TopBarDireScore').text = data.value
} )