package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"encoding/json"
	"os"
	"context"
)

type Response struct {
	Message string `json:"message"`
}

func Handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	//fmt.Println("Received body: ", request.Body)
	fmt.Println("query string params: ", request.QueryStringParameters)

	dbConnStr := fmt.Sprintf("%s:%s@tcp(%s:3306)/cities", os.Getenv("DB_USER"), os.Getenv("DB_PASS"), os.Getenv("DB_HOST"))
	db, err := sql.Open("mysql", dbConnStr)
	if err != nil {
		fmt.Println(err)
	}
	var city City
	err2 := db.QueryRow("SELECT `id`, `name`, `state_id`, `population` FROM `cities` WHERE state_id = ? AND `lowercase_name` = ?", request.QueryStringParameters["state_id"], request.QueryStringParameters["name"]).Scan(&city.ID, &city.Name, &city.StateId, &city.Population)
	switch err2 {
		case sql.ErrNoRows:
			return events.APIGatewayProxyResponse{Body: "City not found", StatusCode: 404, Headers: map[string]string{ "Access-Control-Allow-Origin" : "*" } }, nil
		case nil:
			// fmt.Println(city)
		default:
			panic(err2)
	}
	defer db.Close()

	cityJson, err := json.Marshal(city)
	return events.APIGatewayProxyResponse{ Body: string(cityJson), StatusCode: 200, Headers: map[string]string{ "Access-Control-Allow-Origin" : "*" } }, nil

}

func main() {
	lambda.Start(Handler)
}

type City struct {
	ID 			int `json:"id"`
	Name 		string 	`json:"name"`
	StateId		int `json:"state_id"`
	Population	int `json:"population"`
}

type Request struct {
	Body `json:"body"`
}

type Body struct {
	Name 	string `json:"name"`
	StateId	int `json:"state_id"`
}