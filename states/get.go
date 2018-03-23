package main

import (
	"fmt"
	"os"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

type Response struct {
	Message string `json:"message"`
}

func Handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	dbConnStr := fmt.Sprintf("%s:%s@tcp(%s:3306)/cities", os.Getenv("DB_USER"), os.Getenv("DB_PASS"), os.Getenv("DB_HOST"))
	db, err := sql.Open("mysql", dbConnStr)
	if err != nil {
		fmt.Println(err)
	}

	var states []*State
	rows, err2 := db.Query("SELECT `id`, `name`, `abbr`, `population` FROM `states` ORDER BY `name`")
	if err2 != nil {
		panic(err)
	}
	defer rows.Close()
	for rows.Next() {
		state := new(State)
		if err := rows.Scan(&state.ID, &state.Name, &state.Abbr, &state.Population); err != nil { panic(err.Error()) }
		states = append(states, state)
		//fmt.Println(state)
	}
	defer db.Close()

	statesJson, err := json.Marshal(states)
	return events.APIGatewayProxyResponse{ Body: string(statesJson), StatusCode: 200, Headers: map[string]string{ "Access-Control-Allow-Origin" : "*" } }, nil
}

func main() {
	lambda.Start(Handler)
}

type State struct {
	ID 			int `json:"id"`
	Name 		string `json:"name"`
	Abbr		string `json:"abbr"`
	Population	int `json:"population"`
}