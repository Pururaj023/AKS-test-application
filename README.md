# AKS-test-application

docker build -t demo-nginx .
docker login
docker tag demo-nginx pururajchoudhary23/demo-nginx:1.0
docker push pururajchoudhary23/demo-nginx:1.0
kubectl apply -f deployment.yaml
kubectl get pods
kubectl apply -f service.yaml
kubectl get svc demo-nginx-service
