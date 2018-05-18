var InvalidDataException = function(msg)
{
    this.msg = msg;
    
    this.toString = function()
    {
        return this.msg;
    }
}
