eval $(minikube docker-env)
docker build -t kube-client:0.1 .
kubectl apply -f deployment.yaml
kubectl apply -f node-port.yaml
#for service provider, use load-balancer.yaml instead of node-port.yaml
